"use server"

import { exportDeckList, ExportDeckListResult } from "@/lib/services/exportDeckList"
import { DeckCard } from "@/lib/types/deck"

export async function copyDeckListAction(
    missingCards: DeckCard[]
): Promise<ExportDeckListResult> {
    return exportDeckList(missingCards)
}
