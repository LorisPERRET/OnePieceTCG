"use client"

import { Button } from "@/components/ui/button"
import { markCollectionUpdated } from "@/lib/utils/collectionSync"
import { Minus, Plus, X } from "lucide-react"
import { useState, useTransition } from "react"
import { addCardToCollectionAction } from "../../actions/addCardToCollection.action"
import { useSession } from "next-auth/react"

interface AddCardDialogProps {
    cardId: string;
}

export function AddCardDialog({ cardId }: AddCardDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [quantity, setQuantity] = useState("1")
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState("")

    const { data: session } = useSession()
    const userId = session?.user?.id

    const getQuantityError = (value: string) => {
        if (value.trim() === "") {
            return "La quantite est obligatoire."
        }
        if (!/^\d+$/.test(value)) {
            return "La quantite doit etre un nombre entier."
        }

        const parsed = Number(value)
        if (parsed < 1 || parsed > 99) {
            return "La quantite doit etre comprise entre 1 et 99."
        }

        return null
    }

    const quantityError = getQuantityError(quantity)
    const isQuantityValid = quantityError === null
    const isError = !isQuantityValid || error != ""

    const close = () => {
        setIsOpen(false)
        setQuantity("1")
    }

    const increase = () => {
        const current = isQuantityValid ? Number(quantity) : 0
        setQuantity(String(Math.min(99, current + 1)))
    }

    const decrease = () => {
        const current = isQuantityValid ? Number(quantity) : 1
        setQuantity(String(Math.max(1, current - 1)))
    }

    const addCard = () => {
        startTransition(async () => {

            if (userId != undefined && isQuantityValid) {
                const result = await addCardToCollectionAction(userId, cardId, Number(quantity))
                if (result.success) {
                    markCollectionUpdated()
                    close()
                } else {
                    setError("Une erreur est survenu !")
                }
            }
        })
    }

    return (
        <>
            <Button
                type="button"
                size="icon"
                variant="outline"
                className="size-8"
                onClick={() => setIsOpen(true)}
                aria-label={`Ajouter la carte ${cardId}`}
            >
                <Plus className="size-4" />
            </Button>

            {isOpen ? (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={`add-card-title-${cardId}`}
                    onClick={close}
                >
                    <div
                        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <h2 id={`add-card-title-${cardId}`} className="text-lg font-semibold">
                                    Ajouter une carte
                                </h2>
                                <p className="text-sm text-gray-600">Choisis la quantite a ajouter.</p>
                            </div>
                            <button
                                type="button"
                                className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
                                onClick={close}
                                aria-label="Fermer"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        <label htmlFor={`quantity-${cardId}`} className="mb-2 block text-sm font-medium">
                            Quantite
                        </label>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="size-9"
                                onClick={decrease}
                                aria-label="Diminuer la quantite"
                            >
                                <Minus className="size-4" />
                            </Button>
                            <input
                                id={`quantity-${cardId}`}
                                type="number"
                                min={1}
                                max={99}
                                value={quantity}
                                onChange={(event) => setQuantity(event.target.value)}
                                aria-invalid={!isQuantityValid}
                                className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none"
                                style={
                                    isError
                                        ? {
                                            borderColor: "#ef4444",
                                            boxShadow: "0 0 0 1px #ef4444",
                                        }
                                        : undefined
                                }
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="size-9"
                                onClick={increase}
                                aria-label="Augmenter la quantite"
                            >
                                <Plus className="size-4" />
                            </Button>
                        </div>
                        {isError ? (
                            <p className="mt-2 text-sm !text-red-600">
                                {!isQuantityValid ? quantityError : error}
                            </p>
                        ) : null}

                        <div className="mt-6 flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={close}>
                                Annuler
                            </Button>
                            <Button type="button" onClick={addCard} disabled={!isQuantityValid || isPending}>
                                {isPending ? "Ajout..." : "Ajouter"}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    )
}
