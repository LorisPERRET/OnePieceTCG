import { updateCardQuantity, UpdateCardQuantityResult } from "@/lib/services/updateCardQuantity";

export async function updateCardQuantityAction(
  userId: string,
  cardId: string,
  quantity: number
): Promise<UpdateCardQuantityResult> {
  return updateCardQuantity({userId, cardId, quantity});
}
