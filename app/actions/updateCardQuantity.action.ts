"use server"

import { updateCardQuantity, UpdateCardQuantityResult } from "@/lib/services/updateCardQuantity"
import { auth } from "@/lib/services/auth"

export async function updateCardQuantityAction(
    cardId: string,
    quantity: number
): Promise<UpdateCardQuantityResult> {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    return updateCardQuantity({ userId: session.user.id, cardId, quantity })
}
