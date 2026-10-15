"use server"

import prisma from "@/lib/prisma"
import { DeckCard, ParseDeckResult } from "@/lib/types/deck"

const MAX_DECK_INPUT_CHARS = 20000
const MAX_DECK_LINES = 300

type ParsedDeckLine = {
    section: "leader" | "main" | null;
    quantity: number;
    code: string;
    name: string;
}

function normalizeCardCode(rawCode: string): string {
    const code = rawCode.trim().toUpperCase()

    // Exemples: OP03-123-SR -> OP03-123, OP17-039_P1 (variante alternative) -> OP17-039
    const withOptionalSuffix = code.match(/^([A-Z0-9]+-\d{3})(?:[-_][A-Z0-9]+)?$/)
    if (withOptionalSuffix) {
        return withOptionalSuffix[1]
    }

    // Fallback pour formats inattendus qui contiennent malgré tout un code valide.
    const embeddedCode = code.match(/([A-Z0-9]+-\d{3})/)
    return embeddedCode ? embeddedCode[1] : code
}

export async function parseDeck(input: string, userId: string): Promise<ParseDeckResult> {
    const boundedInput = input.slice(0, MAX_DECK_INPUT_CHARS)
    const lines = boundedInput.split('\n').slice(0, MAX_DECK_LINES)
    const leader: DeckCard[] = []
    const main: DeckCard[] = []
    const parsedLines: ParsedDeckLine[] = []
    let currentSection: 'leader' | 'main' | null = null

    for (const line of lines) {
        const trimmedLine = line.trim()

        // Détecter les sections
        if (trimmedLine.toUpperCase().includes('// LEADER')) {
            currentSection = 'leader'
            continue
        } else if (trimmedLine.toUpperCase().includes('// MAIN')) {
            currentSection = 'main'
            continue
        }

        // Ignorer les lignes vides ou de commentaire seules
        if (!trimmedLine || trimmedLine.startsWith('//')) {
            continue
        }

        // Parser les cartes avec regex flexible, le nom est optionnel
        // Formats: 4x OP03-112-R - Charlotte Pudding (ST20) | 4xOP08-051 | 1xOP17-039_p1
        const match = trimmedLine.match(/^(\d+)\s*x\s*([A-Z0-9]+-\d{3}(?:[-_][A-Z0-9]+)*)\s*(?:-\s*)?(.*?)(?:\(.*?\))?$/i)

        if (match) {
            parsedLines.push({
                // Sans titre de section, la section est déduite du type de la carte
                section: currentSection,
                quantity: parseInt(match[1]),
                code: normalizeCardCode(match[2]),
                name: match[3].trim(),
            })
        }
    }

    if (!parsedLines.length) {
        return { leader, main }
    }

    const uniqueCodes = Array.from(new Set(parsedLines.map((line) => line.code)))

    const [ownedCards, cards] = await Promise.all([
        prisma.collectionCard.findMany({
            where: {
                userId,
                card: {
                    code: {
                        in: uniqueCodes,
                        mode: "insensitive",
                    },
                },
            },
            include: {
                card: {
                    select: {
                        code: true,
                    },
                },
            },
        }),
        prisma.card.findMany({
            where: {
                code: {
                    in: uniqueCodes,
                    mode: "insensitive",
                },
            },
            select: {
                code: true,
                name: true,
                image: true,
                type: true,
            },
        }),
    ])

    const ownedByCode = new Map<string, number>()
    for (const ownedCard of ownedCards) {
        const key = ownedCard.card.code.toUpperCase()
        ownedByCode.set(key, (ownedByCode.get(key) ?? 0) + ownedCard.quantity)
    }

    const cardInfoByCode = new Map<string, { name: string; images: string[]; type: string | null }>()
    for (const card of cards) {
        const key = card.code.toUpperCase()
        const existing = cardInfoByCode.get(key)
        if (!existing) {
            cardInfoByCode.set(key, { name: card.name, images: [card.image], type: card.type })
            continue
        }
        existing.images.push(card.image)
    }

    // Fusionne les lignes d'une même carte (ex: OP17-039 et OP17-039_p1) dans leur section
    const mergedLines = new Map<string, Omit<ParsedDeckLine, "section"> & { section: "leader" | "main" }>()
    for (const parsedLine of parsedLines) {
        const cardInfo = cardInfoByCode.get(parsedLine.code)
        const section = parsedLine.section ?? (cardInfo?.type === "Leader" ? "leader" : "main")
        const key = `${section}:${parsedLine.code}`
        const existing = mergedLines.get(key)
        if (existing) {
            existing.quantity += parsedLine.quantity
        } else {
            mergedLines.set(key, { ...parsedLine, section })
        }
    }

    for (const parsedLine of mergedLines.values()) {
        const ownedQuantity = ownedByCode.get(parsedLine.code) ?? 0
        const owned = Math.min(ownedQuantity, parsedLine.quantity)
        const missing = Math.max(0, parsedLine.quantity - owned)
        const cardInfo = cardInfoByCode.get(parsedLine.code)

        const deckCard: DeckCard = {
            quantity: parsedLine.quantity,
            code: parsedLine.code,
            name: cardInfo?.name ?? parsedLine.name,
            owned: ownedQuantity,
            images: cardInfo?.images ?? [],
            missing,
        }

        if (parsedLine.section === "leader") {
            leader.push(deckCard)
        } else {
            main.push(deckCard)
        }
    }

    return { leader, main }
}
