import prisma from "@/lib/prisma"
import { normalize } from "@/lib/utils/normalizeString"
import type { Card } from "@/app/generated/prisma/client"
import { buildCardFilterWhere, type CardFilters } from "@/lib/utils/cardFilters"
import type { CardWhereInput } from "@/app/generated/prisma/models/Card"

export type GetCardsResult = {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    items: Card[];
};

type GetCardsOptions = {
    page?: number;
    limit?: number;
    query?: string;
    filters?: CardFilters;
};

export async function getCardsPageData(options: GetCardsOptions = {}): Promise<GetCardsResult> {
    const requestedPage = Math.max(1, options.page ?? 1)
    const limit = Math.max(1, Math.min(options.limit ?? 100, 500))
    const skip = (requestedPage - 1) * limit
    const query = normalize(options.query?.trim())
    const where: CardWhereInput = {
        ...buildCardFilterWhere(options.filters),
        ...(query
            ? {
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { code: { contains: query, mode: "insensitive" } },
                ],
            }
            : {}),
    }

    // Les cartes sans code (DON!!) passent en dernier : Prisma ne sait pas trier "vide en dernier",
    // on pagine donc d'abord les cartes avec code, puis celles sans code.
    const whereCoded: CardWhereInput = { AND: [where, { code: { not: "" } }] }
    const whereUncoded: CardWhereInput = { AND: [where, { code: "" }] }

    const [codedCount, uncodedCount] = await Promise.all([
        prisma.card.count({ where: whereCoded }),
        prisma.card.count({ where: whereUncoded }),
    ])
    const totalItems = codedCount + uncodedCount

    const codedItems = skip < codedCount
        ? await prisma.card.findMany({
            where: whereCoded,
            skip,
            take: limit,
            orderBy: [{ code: "asc" }, { id: "asc" }],
        })
        : []
    const remaining = limit - codedItems.length
    const uncodedItems = remaining > 0
        ? await prisma.card.findMany({
            where: whereUncoded,
            skip: Math.max(0, skip - codedCount),
            take: remaining,
            orderBy: { id: "asc" },
        })
        : []
    const items = [...codedItems, ...uncodedItems]

    const totalPages = Math.max(1, Math.ceil(totalItems / limit))
    const page = Math.min(requestedPage, totalPages)

    return {
        page,
        limit,
        totalItems,
        totalPages,
        items,
    }
}
