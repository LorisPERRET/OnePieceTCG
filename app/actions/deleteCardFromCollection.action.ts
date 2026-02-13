"use server"

import { deleteCardFromCollection, DeleteCardFromCollectionResult } from "@/lib/services/deleteCardFromCollection"
import { auth } from "@/lib/services/auth"

export async function deleteCardFromCollectionAction(
    cardId: string
): Promise<DeleteCardFromCollectionResult> {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    return deleteCardFromCollection({ userId: session.user.id, cardId })
}
