import type { CardFilters } from "@/lib/utils/cardFilters"
import { getCollectionPageData, type GetCollectionResult } from "@/lib/services/getCollectionPageData"

export async function getCollectionPageDataAction(
    userId: string,
    page = 1,
    limit = 25,
    query: string | undefined,
    filters?: CardFilters
): Promise<GetCollectionResult> {
    return getCollectionPageData({ userId, page, limit, query, filters })
}