"use client";

import { startTransition, useEffect, useState } from "react";
import { FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeckCard } from "@/lib/services/parseDeck";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";
import { parseDeckAction } from "../actions/parseDeck.action";
import { ParsingResult } from "./parsingResult";
import { ExportDeckListDialog } from "./exportDeckListDialog";

const SAMPLE_DECK = `Exemple de format:

// LEADER
1x OP03-099-L - Charlotte Katakuri (ST20)

// MAIN DECK
4x OP03-112-R - Charlotte Pudding (ST20)
4x OP03-114-SR - Charlotte Linlin
4x OP03-107-C - Charlotte Galette
2x OP11-106-R - Zeus`;

const STORAGE_PREFIX = "deck-view-state";

function isParsedDeck(value: unknown): value is { leader: DeckCard[]; main: DeckCard[] } {
    if (!value || typeof value !== "object") return false;
    const parsed = value as { leader?: unknown; main?: unknown };
    return Array.isArray(parsed.leader) && Array.isArray(parsed.main);
}

export function DeckClient() {
    const [decklistInput, setDecklistInput] = useState('');
    const [parsedDeck, setParsedDeck] = useState<{ leader: DeckCard[], main: DeckCard[] } | null>(null);
    const [isStorageHydrated, setIsStorageHydrated] = useState(false);
    
    const { data: session } = useSession();
    const userId = session?.user?.id;
    const storageKey = `${STORAGE_PREFIX}:${userId ?? "anonymous"}`;

    useEffect(() => {
        if (!userId) return;

        const rawState = localStorage.getItem(storageKey);
        if (!rawState) {
            setIsStorageHydrated(true);
            return;
        }

        try {
            const savedState = JSON.parse(rawState) as { decklistInput?: unknown; parsedDeck?: unknown };
            if (typeof savedState.decklistInput === "string") {
                setDecklistInput(savedState.decklistInput);
            }
            if (isParsedDeck(savedState.parsedDeck)) {
                setParsedDeck(savedState.parsedDeck);
            }
        } catch {
            // Ignore malformed local storage and continue with empty state.
        } finally {
            setIsStorageHydrated(true);
        }
    }, [storageKey, userId]);

    useEffect(() => {
        if (!userId || !isStorageHydrated) return;
        localStorage.setItem(storageKey, JSON.stringify({ decklistInput, parsedDeck }));
    }, [decklistInput, isStorageHydrated, parsedDeck, storageKey, userId]);

    const handleAnalyze = () => {
        startTransition(async () => {
            if (userId != undefined) {
                const result = await parseDeckAction(decklistInput, userId);
                setParsedDeck(result);
            }
        })
    };

    const totalOwned = parsedDeck ? [...parsedDeck.leader, ...parsedDeck.main].reduce((sum, card) => sum + card.owned, 0) : 0;
    const totalNeeded = parsedDeck ? [...parsedDeck.leader, ...parsedDeck.main].reduce((sum, card) => sum + card.quantity, 0) : 0;
    const totalMissing = parsedDeck ? [...parsedDeck.leader, ...parsedDeck.main].reduce((sum, card) => sum + card.missing, 0) : 0;
    const completionRate = totalNeeded > 0 ? Math.round((totalOwned / totalNeeded) * 100) : 0;
    const missingCards = parsedDeck ? [...parsedDeck.leader, ...parsedDeck.main].filter((card) => card.missing > 0) : [];

    const renderCardList = (cards: DeckCard[], title: string) => {
        if (cards.length === 0) return null;

        return (
            <ParsingResult cards={cards} title={title} />
        );
    };
    
    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <FileText className="size-5" />
                    <h2 className="text-xl font-medium">Analyser une decklist</h2>
                </div>
                <p className="text-sm text-gray-600">
                    Collez votre decklist ci-dessous pour voir les cartes que vous possédez et celles qui vous manquent.
                </p>
            </div>

            <div className="space-y-3">
                <Textarea
                    placeholder={SAMPLE_DECK}
                    value={decklistInput}
                    onChange={(e) => setDecklistInput(e.target.value)}
                    className="min-h-[300px] font-mono text-sm"
                />
                <Button onClick={handleAnalyze} className="w-full" disabled={!decklistInput.trim()}>
                    Analyser le deck
                </Button>
            </div>

            {parsedDeck && (parsedDeck.leader.length > 0 || parsedDeck.main.length > 0) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Résultats de l&apos;analyse</span>
                            <Badge variant={completionRate === 100 ? 'default' : 'secondary'} className="text-base px-3 py-1">
                                {completionRate}% complet
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{totalOwned}</div>
                                <div className="text-sm text-gray-600">Possédées</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-600">{totalMissing}</div>
                                <div className="text-sm text-gray-600">Manquantes</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">{totalNeeded}</div>
                                <div className="text-sm text-gray-600">Total</div>
                            </div>
                        </div>

                        {renderCardList(parsedDeck.leader, '🎯 Leader')}
                        {renderCardList(parsedDeck.main, '📚 Main Deck')}

                        {totalMissing > 0 && (
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h4 className="font-medium text-amber-900 mb-2">🛒 Cartes à acheter</h4>
                                        <p className="text-sm text-amber-800">
                                            Il vous manque {totalMissing} carte{totalMissing > 1 ? 's' : ''} pour compléter ce deck.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ExportDeckListDialog missingCards={missingCards} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
