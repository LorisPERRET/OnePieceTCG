"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { validateCardId, validateQuantity } from "../utils/collectionValidation"

export type UpdateCardQuantityResult = {
    success: boolean;
    error?: string;
};

type UpdateCardQuantityOption = {
    userId: string;
    cardId: string;
    quantity: number;
};

export async function updateCardQuantity(options: UpdateCardQuantityOption): Promise<UpdateCardQuantityResult> {
    const cardIdError = validateCardId(options.cardId)
    if (cardIdError) {
        return { success: false, error: cardIdError }
    }

    const quantityError = validateQuantity(options.quantity)
    if (quantityError) {
        return { success: false, error: quantityError }
    }

    await prisma.collectionCard.update({
        where: {
            userId_cardId: {
                userId: options.userId,
                cardId: options.cardId,
            },
        },
        data: {
            quantity: {
                set: options.quantity,
            },
        },
    })

    revalidatePath("/collection")

    return { success: true }
}
