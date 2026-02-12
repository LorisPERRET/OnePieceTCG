"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
  });

  revalidatePath("/collection");

  return { success: true };
}