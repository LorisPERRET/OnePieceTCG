"use client"

import { DeckCard } from "@/lib/services/parseDeck"

export type ExportDeckListResult = {
    success: boolean;
    error?: string;
    feedback?: string;
};

type MakeContentResult = {
    success: boolean;
    error?: string;
    content?: string;
};

function makeContent(
    missingCards: DeckCard[]
): MakeContentResult {
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
        content: lines.join("\n")
    }
}

export async function downloadDeckList(
    missingCards: DeckCard[]
): Promise<ExportDeckListResult> {
    const result = makeContent(missingCards)
    if (!result.success || !result.content) {
        return {
            success: false,
            error: result.error ?? "Erreur pendant l'export.",
        }
    }

    const blob = new Blob([result.content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "cartes-manquantes.txt"
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)

    return {
        success: true,
    }
}

export async function copyDeckList(
    missingCards: DeckCard[]
): Promise<ExportDeckListResult> {
    const result = makeContent(missingCards)
    if (!result.success || !result.content) {
        return {
            success: false,
            error: result.error ?? "Erreur pendant l'export.",
        }
    }

    try {
        await navigator.clipboard.writeText(result.content)

        return {
            success: true,
            feedback: "Copié"
        }
    } catch {
        return {
            success: false,
            error: "Échec de copie"
        }
    }
}
