import "dotenv/config"
import prisma from "../lib/prisma"

type ApiCard = {
    _id: number;
    code?: string | null;
    name: string;
    images?: {
        small?: string | null;
        medium?: string | null;
        large?: string | null;
    }[];
    attributes?: Record<string, string | undefined>;
    set?: {
        name?: string | null;
    } | null;
};

type ApiResponse = {
    success: boolean;
    total: number;
    data: ApiCard[];
};

const API_URL = "https://api.apitcg.com/api/products"
const API_KEY = process.env.API_TCG_KEY
const PAGE_SIZE = 100

function toNullableInt(value: number | string | null | undefined): number | null {
    if (value === null || value === undefined) {
        return null
    }

    const parsed = typeof value === "number" ? value : Number(value)
    return Number.isFinite(parsed) ? parsed : null
}

async function fetchPage(page: number): Promise<ApiResponse> {
    if (!API_KEY) {
        throw new Error("Missing API_TCG_KEY")
    }

    const url = new URL(API_URL)
    url.searchParams.set("tcg", "one-piece")
    url.searchParams.set("type", "card")
    url.searchParams.set("page", String(page))
    url.searchParams.set("limit", String(PAGE_SIZE))

    const res = await fetch(url.toString(), {
        headers: {
            "x-api-key": `${API_KEY}`,
        },
    })

    if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(`APITCG error ${res.status}: ${text}`)
    }

    return (await res.json()) as ApiResponse
}

async function main() {
    const first = await fetchPage(1)
    const cards: ApiCard[] = [...first.data]
    const totalPages = Math.max(1, Math.ceil(first.total / PAGE_SIZE))

    for (let page = 2; page <= totalPages; page += 1) {
        const next = await fetchPage(page)
        cards.push(...next.data)
    }

    if (!cards.length) {
        console.log("[sync] no cards received")
        return
    }

    console.log(`[sync] received ${cards.length} cards`)

    const operations = cards.map((card) => {
        const attrs = card.attributes ?? {}
        const data = {
            code: card.code ?? attrs.Number ?? "",
            rarity: attrs.Rarity ?? null,
            type: attrs.CardType ?? null,
            name: card.name,
            image: card.images?.[0]?.small || "",
            cost: toNullableInt(attrs.Cost),
            attributeName: attrs.Attribute ?? null,
            attributeImage: null,
            power: toNullableInt(attrs.Power),
            counter: attrs.Counterplus ?? null,
            color: attrs.Color ?? null,
            family: attrs.Subtypes ?? null,
            ability: attrs.Description ?? null,
            trigger: null,
            setName: card.set?.name ?? null,
            raw: card as object,
        }

        return prisma.card.upsert({
            where: { id: String(card._id) },
            update: data,
            create: { id: String(card._id), ...data },
        })
    })

    const BATCH_SIZE = 250
    for (let i = 0; i < operations.length; i += BATCH_SIZE) {
        await prisma.$transaction(operations.slice(i, i + BATCH_SIZE))
    }
    console.log("[sync] upsert complete")
}

main()
    .catch((err) => {
        console.error("[sync] failed", err)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })