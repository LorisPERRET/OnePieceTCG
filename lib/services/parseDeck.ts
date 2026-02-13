"use server"

import prisma from "@/lib/prisma"

export type DeckCard = {
    quantity: number;
    code: string;
    name: string;
    images: string[];
    owned: number;
    missing: number;
}

export type ParseDeckResult = {
    leader: DeckCard[];
    main: DeckCard[];
}

const MAX_DECK_INPUT_CHARS = 20000
const MAX_DECK_LINES = 300

type ParsedDeckLine = {
    section: "leader" | "main";
    quantity: number;
    code: string;
    name: string;
}

function normalizeCardCode(rawCode: string): string {
    const code = rawCode.trim().toUpperCase()

    // Exemple: OP03-123-SR -> OP03-123
    const withOptionalSuffix = code.match(/^([A-Z0-9]+-\d{3})(?:-[A-Z0-9]+)?$/)
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

        // Parser les cartes avec regex flexible
        // Format: 4x OP03-112-R - Charlotte Pudding (ST20)
        const match = trimmedLine.match(/^(\d+)x\s+([A-Z0-9-]+)\s*-?\s*(.+?)(?:\(.*?\))?$/i)

        if (match) {
            const quantity = parseInt(match[1])
            const code = normalizeCardCode(match[2])
            const name = match[3].trim()

            if (currentSection) {
                parsedLines.push({
                    section: currentSection,
                    quantity,
                    code,
                    name,
                })
            }
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
            },
        }),
    ])

    const ownedByCode = new Map<string, number>()
    for (const ownedCard of ownedCards) {
        const key = ownedCard.card.code.toUpperCase()
        ownedByCode.set(key, (ownedByCode.get(key) ?? 0) + ownedCard.quantity)
    }

    const cardInfoByCode = new Map<string, { name: string; images: string[] }>()
    for (const card of cards) {
        const key = card.code.toUpperCase()
        const existing = cardInfoByCode.get(key)
        if (!existing) {
            cardInfoByCode.set(key, { name: card.name, images: [card.image] })
            continue
        }
        existing.images.push(card.image)
    }

    for (const parsedLine of parsedLines) {
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
