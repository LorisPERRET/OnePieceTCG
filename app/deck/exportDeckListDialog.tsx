"use client";

import { Button } from "@/components/ui/button";
import { DeckCard } from "@/lib/services/parseDeck";
import { X } from "lucide-react";
import { useState, useTransition } from "react";
import { copyDeckListAction } from "../actions/copyDeckList.action";
import { downloadDeckListAction } from "../actions/downloadDeckList.action";

interface ExportDeckListDialogProps {
    missingCards: DeckCard[];
}

export function ExportDeckListDialog({ missingCards }: ExportDeckListDialogProps) {    
        const [feedback, setFeedback] = useState("");
        const [showExportOptions, setShowExportOptions] = useState(false);
        const [isPending, startTransition] = useTransition();

        const close = () => {
                setFeedback("")
                setShowExportOptions(false)
        }

    const handleDownloadMissingCards = () => {
        startTransition(async () => {
            const result = await downloadDeckListAction(missingCards);
            if (!result.success) {
                setFeedback(result.error ?? "Erreur pendant l'export.");
                return;
            }

            close();
        });
    };

    const handleCopyMissingCards = async () => {
        startTransition(async () => {
            const result = await copyDeckListAction(missingCards);
            if (!result.success) {
                setFeedback(result.error ?? "Erreur pendant l'export.");
                return;
            }

            setFeedback(result.feedback ?? "Succès");
        });
    };

        return (
                <>
                        <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowExportOptions(true)}
                        >
                                Exporter les manquantes
                        </Button>

                        {showExportOptions ? (
                                <div
                                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                                        role="dialog"
                                        aria-modal="true"
                                        aria-labelledby="export-missing-cards-title"
                                        onClick={() => close()}
                                >
                                        <div
                                                className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
                                                onClick={(event) => event.stopPropagation()}
                                        >
                                                <div className="mb-4 flex items-start justify-between gap-3">
                                                        <div>
                                                                <h3 id="export-missing-cards-title" className="text-lg font-semibold">
                                                                Export des cartes manquantes
                                                                </h3>
                                                                <p className="text-sm text-gray-600">Choisis le format d&apos;export.</p>
                                                        </div>
                                                        <button
                                                                type="button"
                                                                className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
                                                                onClick={() => close()}
                                                                aria-label="Fermer"
                                                        >
                                                                <X className="size-4" />
                                                        </button>
                                                </div>
                                                
                                                {feedback ? (
                                                        <div className="flex items-center justify-center">
                                                                <span className="text-sm">{feedback}</span>
                                                        </div>
                                                ) : (
                                                        <div className="mt-6 flex justify-end gap-2">
                                                                <Button type="button" variant="outline" onClick={handleCopyMissingCards} disabled={isPending}>
                                                                        Copier
                                                                </Button>
                                                                <Button type="button" onClick={handleDownloadMissingCards} disabled={isPending}>
                                                                        {isPending ? "Export..." : "Télécharger .txt"}
                                                                </Button>
                                                        </div>
                                                )}
                                        </div>
                                </div>
                        ) : null}
                </>
        )
}
