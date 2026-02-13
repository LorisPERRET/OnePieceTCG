"use server";

import prisma from "@/lib/prisma";
import { CollectionCardAndQuantity } from "./getCollectionPageData";
import { Card } from "@/app/generated/prisma/client";

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

function normalizeCardCode(rawCode: string): string {
    const code = rawCode.trim().toUpperCase();

    // Exemple: OP03-123-SR -> OP03-123
    const withOptionalSuffix = code.match(/^([A-Z0-9]+-\d{3})(?:-[A-Z0-9]+)?$/);
    if (withOptionalSuffix) {
        return withOptionalSuffix[1];
    }

    // Fallback pour formats inattendus qui contiennent malgré tout un code valide.
    const embeddedCode = code.match(/([A-Z0-9]+-\d{3})/);
    return embeddedCode ? embeddedCode[1] : code;
}

export async function parseDeck(input: string, userId: string): Promise<ParseDeckResult> {
        const lines = input.split('\n');
        const leader: DeckCard[] = [];
        const main: DeckCard[] = [];
        let currentSection: 'leader' | 'main' | null = null;

        for (const line of lines) {
            const trimmedLine = line.trim();
            
            // Détecter les sections
            if (trimmedLine.toUpperCase().includes('// LEADER')) {
                currentSection = 'leader';
                continue;
            } else if (trimmedLine.toUpperCase().includes('// MAIN')) {
                currentSection = 'main';
                continue;
            }

            // Ignorer les lignes vides ou de commentaire seules
            if (!trimmedLine || trimmedLine.startsWith('//')) {
                continue;
            }

            // Parser les cartes avec regex flexible
            // Format: 4x OP03-112-R - Charlotte Pudding (ST20)
            const match = trimmedLine.match(/^(\d+)x\s+([A-Z0-9-]+)\s*-?\s*(.+?)(?:\(.*?\))?$/i);
            
            if (match) {
                const quantity = parseInt(match[1]);
                const code = normalizeCardCode(match[2]);
                const name = match[3].trim();

                // Trouver dans la collection
                const ownedCard: CollectionCardAndQuantity[] = await prisma.collectionCard.findMany({
                        where: {
                                userId,
                                card: {
                                code: {
                                        equals: code,
                                        mode: "insensitive",
                                },
                                },
                        },
                        include: {
                                card: true,
                        },
                });

                // Trouver dans la collection
                const cards: Card[] = await prisma.card.findMany({
                        where: {
                                code
                        }
                });

                const ownedQuantity = ownedCard.reduce((sum, card) => sum + card.quantity, 0);
                const owned = ownedCard ? Math.min(ownedQuantity, quantity) : 0;
                const missing = Math.max(0, quantity - owned);

                const deckCard: DeckCard = {
                    quantity,
                    code,
                    name: cards[0]?.name ?? name,
                    owned: ownedQuantity,
                    images: cards.map((card) => (card.image)),
                    missing
                };

                if (currentSection === 'leader') {
                    leader.push(deckCard);
                } else if (currentSection === 'main') {
                    main.push(deckCard);
                }
            }
        }

        return { leader, main };
    };
