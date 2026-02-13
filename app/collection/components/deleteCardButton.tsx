"use client"

import { Button } from "@/components/ui/button"
import { Trash2, X } from "lucide-react"
import { useSession } from "next-auth/react"
import { useState, useTransition } from "react"
import { deleteCardFromCollectionAction } from "../../actions/deleteCardFromCollection.action"
import { markCollectionUpdated } from "@/lib/utils/collectionSync"

interface DeleteCardButtonProps {
    cardId: string;
    cardName: string;
}

export function DeleteCardButton(options: DeleteCardButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const { data: session } = useSession()
    const userId = session?.user?.id

    function onDeleteCard(id: string): void {
        startTransition(async () => {
            if (userId != undefined) {
                const result = await deleteCardFromCollectionAction(userId, id)
                if (result.success) {
                    setIsOpen(false)
                    markCollectionUpdated()
                }
            }
        })
    }

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                aria-label={`Supprimer ${options.cardName}`}
            >
                <Trash2 className="size-4" />
            </Button>

            {isOpen ? (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-card-title"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <h3 id="delete-card-title" className="text-lg font-semibold">
                                    Supprimer cette carte ?
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {options.cardName} sera retirée de votre collection.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
                                onClick={() => setIsOpen(false)}
                                aria-label="Fermer"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
                                Annuler
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => onDeleteCard(options.cardId)}
                                disabled={isPending}
                                className="bg-red-600 text-white hover:bg-red-700"
                            >
                                {isPending ? "Suppression..." : "Supprimer"}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    )
}
