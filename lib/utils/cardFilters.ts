import type { CardWhereInput } from "@/app/generated/prisma/models/Card"

export type CardFilters = {
    set?: string[];
    color?: string[];
    rarity?: string[];
    type?: string[];
}

export const CARD_FILTER_KEYS = ["set", "color", "rarity", "type"] as const

type SearchParamValue = string | string[] | undefined

function toArray(value: SearchParamValue): string[] {
    if (Array.isArray(value)) return value.filter(Boolean)
    return value ? [value] : []
}

export function parseCardFilters(searchParams: Record<string, SearchParamValue>): CardFilters {
    return Object.fromEntries(
        CARD_FILTER_KEYS.map((key) => [key, toArray(searchParams[key])])
    )
}

// Valeurs d'un même filtre : OR. Filtres différents : AND.
export function buildCardFilterWhere(filters: CardFilters = {}): CardWhereInput {
    const and: CardWhereInput[] = []

    if (filters.set?.length) and.push({ setName: { in: filters.set } })
    // Les cartes multicolores stockent leurs couleurs séparées par ";" (ex: "Red;Black")
    if (filters.color?.length) and.push({ OR: filters.color.map((color) => ({ color: { contains: color } })) })
    if (filters.rarity?.length) and.push({ rarity: { in: filters.rarity } })
    if (filters.type?.length) and.push({ type: { in: filters.type } })

    return and.length ? { AND: and } : {}
}
