import { deleteCardFromCollection, DeleteCardFromCollectionResult } from "@/lib/services/deleteCardFromCollection";

export async function deleteCardFromCollectionAction(
    userId: string,
    cardId: string
): Promise<DeleteCardFromCollectionResult> {
    return deleteCardFromCollection({userId, cardId});
}
