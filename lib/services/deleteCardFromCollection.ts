"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type DeleteCardFromCollectionResult = {
  success: boolean;
  error?: string;
};

type DeleteCardFromCollectionOption = {
  userId: string;
  cardId: string;
};

export async function deleteCardFromCollection(options: DeleteCardFromCollectionOption): Promise<DeleteCardFromCollectionResult> {
  await prisma.collectionCard.delete({
    where: {
      userId_cardId: {
        userId: options.userId,
        cardId: options.cardId,
      },
    }
  });

  revalidatePath("/collections");

  return { success: true };
}