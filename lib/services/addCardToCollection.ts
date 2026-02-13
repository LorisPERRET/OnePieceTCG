"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { validateCardId, validateQuantity } from "../utils/collectionValidation"

export type AddCardToCollectionResult = {
    success: boolean;
    error?: string;
};

type AddCardToCollectionOption = {
    userId: string;
    cardId: string;
    quantity: number;
};

export async function addCardToCollection(options: AddCardToCollectionOption): Promise<AddCardToCollectionResult> {
    const cardIdError = validateCardId(options.cardId)
    if (cardIdError) {
        return { success: false, error: cardIdError }
    }

    const quantityError = validateQuantity(options.quantity)
    if (quantityError) {
        return { success: false, error: quantityError }
    }

    await prisma.collectionCard.upsert({
        where: {
            userId_cardId: {
                userId: options.userId,
                cardId: options.cardId,
            },
        },
        create: {
            userId: options.userId,
            cardId: options.cardId,
            quantity: options.quantity,
        },
        update: {
            quantity: {
                increment: options.quantity,
            },
        },
    })

    revalidatePath("/cards")

    return { success: true }
}
