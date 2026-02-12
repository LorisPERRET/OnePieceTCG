import { getCardsPageData, type GetCardsResult } from "@/lib/services/getCardsPageData";

export async function getCardsPageDataAction(
  page = 1,
  limit = 25,
  query: string | undefined
): Promise<GetCardsResult> {
  return getCardsPageData({ page, limit, query });
}
