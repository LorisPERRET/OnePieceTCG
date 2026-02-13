import { getCollectionPageData, type GetCollectionResult } from "@/lib/services/getCollectionPageData";

export async function getCollectionPageDataAction(
    userId: string,
    page = 1,
    limit = 25,
    query: string | undefined
): Promise<GetCollectionResult> {
    return getCollectionPageData({ userId, page, limit, query });
}