"use server"

import { DeckCard } from "@/lib/services/parseDeck"
import {
    downloadDeckList,
    ExportDeckListResult,
} from "@/lib/services/exportDeckList"

export async function downloadDeckListAction(
    missingCards: DeckCard[]
): Promise<ExportDeckListResult> {
    return downloadDeckList(missingCards)
}
