"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

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