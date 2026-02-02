// app/api/cards/route.ts
import prisma from "@/lib/prisma";
import type { CardData } from "@/app/generated/prisma/client";
import { CardDataWhereInput } from "@/app/generated/prisma/models/CardData";

export type GetCardsResult = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: CardData[];
};

type GetCardsOptions = {
  page?: number;
  limit?: number;
  query?: string;
};

export async function getCards(options: GetCardsOptions = {}): Promise<GetCardsResult> {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.max(1, Math.min(options.limit ?? 100, 500));
  const skip = (page - 1) * limit;
  const query = options.query?.trim();
  const where: CardDataWhereInput | undefined = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { code: { contains: query, mode: "insensitive" } },
        ],
      }
    : undefined;

  const [total, data] = await Promise.all([
    prisma.cardData.count({ where }),
    prisma.cardData.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: "asc" },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    page,
    limit,
    total,
    totalPages,
    data,
  };
}
