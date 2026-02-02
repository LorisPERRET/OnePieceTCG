import { getCards, type GetCardsResult } from "@/lib/services/getCards";

export async function getCardsAction(
  page = 1,
  limit = 25,
  query: string | undefined
): Promise<GetCardsResult> {
  return getCards({ page, limit, query });
}
