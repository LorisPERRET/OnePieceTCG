import type { CardFilters } from "@/lib/utils/cardFilters"
import { getCardsPageData, type GetCardsResult } from "@/lib/services/getCardsPageData"

export async function getCardsPageDataAction(
    page = 1,
    limit = 25,
    query: string | undefined,
    filters?: CardFilters
): Promise<GetCardsResult> {
    return getCardsPageData({ page, limit, query, filters })
}
