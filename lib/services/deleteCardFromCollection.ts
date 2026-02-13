"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { validateCardId } from "../utils/collectionValidation"

export type DeleteCardFromCollectionResult = {
    success: boolean;
    error?: string;
};

type DeleteCardFromCollectionOption = {
    userId: string;
    cardId: string;
};

export async function deleteCardFromCollection(options: DeleteCardFromCollectionOption): Promise<DeleteCardFromCollectionResult> {
    const cardIdError = validateCardId(options.cardId)
    if (cardIdError) {
        return { success: false, error: cardIdError }
    }

    await prisma.collectionCard.delete({
        where: {
            userId_cardId: {
                userId: options.userId,
                cardId: options.cardId,
            },
        }
    })

    revalidatePath("/collections")

    return { success: true }
}
