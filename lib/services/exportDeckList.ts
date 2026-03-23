import { DeckCard } from "@/lib/types/deck"

export type ExportDeckListResult = {
    success: boolean;
    error?: string;
    content?: string;
    filename?: string;
};

export async function exportDeckList(
    missingCards: DeckCard[]
): Promise<ExportDeckListResult> {
    if (!missingCards.length) {
        return {
            success: false,
            error: "Aucune carte manquante a exporter.",
        }
    }

    const lines = missingCards
        .filter((card) => card.missing > 0)
        .map((card) => `${card.missing}x ${card.name} ${card.code}`)

    if (!lines.length) {
        return {
            success: false,
            error: "Aucune carte manquante a exporter.",
        }
    }

    return {
        success: true,
        content: lines.join("\n"),
        filename: "cartes-manquantes.txt",
    }
}
