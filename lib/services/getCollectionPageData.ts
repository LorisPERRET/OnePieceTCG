import prisma from "@/lib/prisma"
import { normalize } from "@/lib/utils/normalizeString"
import type { Card } from "@/app/generated/prisma/client"
import { buildCardFilterWhere, type CardFilters } from "@/lib/utils/cardFilters"
import type { CardWhereInput } from "@/app/generated/prisma/models/Card"
import type { CollectionCardWhereInput } from "@/app/generated/prisma/models/CollectionCard"

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
    filters?: CardFilters;
};

export async function getCollectionPageData(options: GetCollectionOptions): Promise<GetCollectionResult> {
    const requestedPage = Math.max(1, options.page ?? 1)
    const limit = Math.max(1, Math.min(options.limit ?? 100, 500))
    const skip = (requestedPage - 1) * limit
    const query = normalize(options.query?.trim())
    const userId = options.userId
    const cardWhere: CardWhereInput = {
        ...buildCardFilterWhere(options.filters),
        ...(query
            ? {
                OR: [
                    { code: { contains: query, mode: "insensitive" } },
                    { name: { contains: query, mode: "insensitive" } },
                ],
            }
            : {}),
    }

    // Les cartes sans code (DON!!) passent en dernier : Prisma ne sait pas trier "vide en dernier",
    // on pagine donc d'abord les cartes avec code, puis celles sans code.
    const whereCoded: CollectionCardWhereInput = { userId, card: { AND: [cardWhere, { code: { not: "" } }] } }
    const whereUncoded: CollectionCardWhereInput = { userId, card: { AND: [cardWhere, { code: "" }] } }

    const [codedCount, uncodedCount] = await Promise.all([
        prisma.collectionCard.count({ where: whereCoded }),
        prisma.collectionCard.count({ where: whereUncoded }),
    ])
    const totalItems = codedCount + uncodedCount

    const codedItems = skip < codedCount
        ? await prisma.collectionCard.findMany({
            where: whereCoded,
            skip,
            take: limit,
            orderBy: [{ card: { code: "asc" } }, { id: "asc" }],
            include: { card: true },
        })
        : []
    const remaining = limit - codedItems.length
    const uncodedItems = remaining > 0
        ? await prisma.collectionCard.findMany({
            where: whereUncoded,
            skip: Math.max(0, skip - codedCount),
            take: remaining,
            orderBy: { id: "asc" },
            include: { card: true },
        })
        : []
    const items = [...codedItems, ...uncodedItems]

    const totalPages = Math.max(1, Math.ceil(totalItems / limit))
    const page = Math.min(requestedPage, totalPages)
    const mappedItems: CollectionCardAndQuantity[] = items.map((item) => ({
        card: item.card,
        quantity: item.quantity,
    }))

    return {
        page,
        limit,
        totalItems,
        totalPages,
        items: mappedItems,
    }
}
