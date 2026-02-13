import prisma from "@/lib/prisma";
import { normalize } from "@/lib/utils/normalizeString";
import type { Card } from "@/app/generated/prisma/client";
import type { CardWhereInput } from "@/app/generated/prisma/models/Card";

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
};

export async function getCardsPageData(options: GetCardsOptions = {}): Promise<GetCardsResult> {
    const requestedPage = Math.max(1, options.page ?? 1);
    const limit = Math.max(1, Math.min(options.limit ?? 100, 500));
    const skip = (requestedPage - 1) * limit;
    const query = normalize(options.query?.trim());
    const where: CardWhereInput | undefined = query
        ? {
            OR: [
                { name: { contains: query, mode: "insensitive" } },
                { code: { contains: query, mode: "insensitive" } },
            ],
        }
        : undefined;

    const [totalItems, items] = await Promise.all([
        prisma.card.count({ where }),
        prisma.card.findMany({
            where,
            skip,
            take: limit,
            orderBy: { id: "asc" },
        }),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const page = Math.min(requestedPage, totalPages);

    return {
        page,
        limit,
        totalItems,
        totalPages,
        items,
    };
}
