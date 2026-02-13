import { DeckCard } from "@/lib/services/parseDeck"
import {
    copyDeckList,
    ExportDeckListResult,
} from "@/lib/services/exportDeckList"

export async function copyDeckListAction(
    missingCards: DeckCard[]
): Promise<ExportDeckListResult> {
    return copyDeckList(missingCards)
}
