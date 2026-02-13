"use server"

import { addCardToCollection, AddCardToCollectionResult } from "@/lib/services/addCardToCollection"
import { auth } from "@/lib/services/auth"

export async function addCardToCollectionAction(
    cardId: string,
    quantity: number
): Promise<AddCardToCollectionResult> {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    return addCardToCollection({ userId: session.user.id, cardId, quantity })
}
