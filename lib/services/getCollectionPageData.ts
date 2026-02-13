import prisma from "@/lib/prisma";
import { normalize } from "@/lib/utils/normalizeString";
import type { Card } from "@/app/generated/prisma/client";
import type { CollectionCardWhereInput } from "@/app/generated/prisma/models/CollectionCard";

export type CollectionCardAndQuantity = {
    card: Card;
    quantity: number;
}

export type GetCollectionResult = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  items: CollectionCardAndQuantity[];
};

type GetCollectionOptions = {
  userId: string;
  page?: number;
  limit?: number;
  query?: string;
};

export async function getCollectionPageData(options: GetCollectionOptions): Promise<GetCollectionResult> {
  const requestedPage = Math.max(1, options.page ?? 1);
  const limit = Math.max(1, Math.min(options.limit ?? 100, 500));
  const skip = (requestedPage - 1) * limit;
  const query = normalize(options.query?.trim());
  const userId = options.userId;
  const where: CollectionCardWhereInput = {
    userId,
    ...(query
      ? {
          OR: [
            { card: { code: { contains: query, mode: "insensitive" } } },
            { card: { name: { contains: query, mode: "insensitive" } } }
          ]
        }
      : {})
  };

  const [totalItems, items] = await prisma.$transaction([
    prisma.collectionCard.count({ where }),
    prisma.collectionCard.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: "asc" },
      include: {
        card: true,
      },
    })
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const page = Math.min(requestedPage, totalPages);
  const mappedItems: CollectionCardAndQuantity[] = items.map((item) => ({
    card: item.card,
    quantity: item.quantity,
  }));

  return {
    page,
    limit,
    totalItems,
    totalPages,
    items: mappedItems,
  }
}
