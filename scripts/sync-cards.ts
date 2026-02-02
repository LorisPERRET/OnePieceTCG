import "dotenv/config";
import prisma from "../lib/prisma";

type ApiCard = {
  id: string;
  code: string;
  name: string;
  images: {
    small: string
  };
};

type ApiResponse = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: ApiCard[];
};

const API_URL = process.env.APITCG_API_URL || "https://apitcg.com/api/one-piece/cards";
const API_KEY = process.env.APITCG_API_KEY;

async function fetchPage(page: number): Promise<ApiResponse> {
  if (!API_KEY) {
    throw new Error("Missing APITCG_API_KEY");
  }

  const url = new URL(API_URL);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(100));

  const res = await fetch(url.toString(), {
    headers: {
      "x-api-key": `${API_KEY}`,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`APITCG error ${res.status}: ${text}`);
  }

  return (await res.json()) as ApiResponse;
}

async function main() {
  const first = await fetchPage(1);
  const cards: ApiCard[] = [...first.data];
  const totalPages = first.totalPages || 1;

  for (let page = 2; page <= totalPages; page += 1) {
    const next = await fetchPage(page);
    cards.push(...next.data);
  }

  if (!cards.length) {
    console.log("[sync] no cards received");
    return;
  }

  console.log(`[sync] received ${cards.length} cards`);

  const operations = cards.map((card) =>
    prisma.cardData.upsert({
      where: { id: card.id },
      update: {
        code: card.code,
        name: card.name,
        image: card.images.small || "",
      },
      create: {
        id: card.id,
        code: card.code,
        name: card.name,
        image: card.images.small || "",
      },
    })
  );

  await prisma.$transaction(operations);
  console.log("[sync] upsert complete");
}

main()
  .catch((err) => {
    console.error("[sync] failed", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
