export const MAX_COLLECTION_QUANTITY = 99

export function validateCardId(cardId: string): string | null {
    const value = cardId.trim()
    if (!value) {
        return "cardId invalide."
    }
    if (value.length > 128) {
        return "cardId invalide."
    }
    if (/\s/.test(value)) {
        return "cardId invalide."
    }
    return null
}

export function validateQuantity(quantity: number): string | null {
    if (!Number.isInteger(quantity)) {
        return "La quantite doit etre un entier."
    }
    if (quantity < 1 || quantity > MAX_COLLECTION_QUANTITY) {
        return `La quantite doit etre comprise entre 1 et ${MAX_COLLECTION_QUANTITY}.`
    }
    return null
}
