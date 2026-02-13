import { addCardToCollection, AddCardToCollectionResult } from "@/lib/services/addCardToCollection"

export async function addCardToCollectionAction(
    userId: string,
    cardId: string,
    quantity: number
): Promise<AddCardToCollectionResult> {
    return addCardToCollection({ userId, cardId, quantity })
}
