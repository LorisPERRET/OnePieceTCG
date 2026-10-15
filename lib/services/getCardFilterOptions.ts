import prisma from "@/lib/prisma"

export type SetOption = {
    value: string;
    label: string;
}

export type CardFilterOptions = {
    sets: SetOption[];
    colors: string[];
    rarities: string[];
    types: string[];
}

function clean(values: (string | null)[]): string[] {
    return [...new Set(values.filter((value): value is string => !!value?.trim()))]
}

const compact = (value: string) => value.replace(/[^a-z0-9]/gi, "").toLowerCase()

// Code du set : celui fourni par l'API s'il existe, sinon le préfixe le plus fréquent des codes de ses cartes (ex: "OP16-077" -> "OP16")
async function getSetOptions(): Promise<SetOption[]> {
    const rows = await prisma.$queryRaw<{ name: string; code: string | null }[]>`
        SELECT "setName" AS name,
               COALESCE(MAX(raw->'set'->>'code'), MODE() WITHIN GROUP (ORDER BY NULLIF(split_part(code, '-', 1), ''))) AS code
        FROM "Card"
        WHERE "setName" IS NOT NULL AND "setName" <> ''
        GROUP BY "setName"
    `

    return rows
        .map(({ name, code }) => ({
            value: name,
            code,
            // Le nom contient parfois déjà le code (ex: "ST-30: Starter Deck 30...")
            label: code && !compact(name).startsWith(compact(code)) ? `${code} - ${name}` : name,
        }))
        .sort((a, b) => {
            if (!a.code !== !b.code) return a.code ? -1 : 1
            return compact(a.code ?? "").localeCompare(compact(b.code ?? ""), undefined, { numeric: true })
                || a.value.localeCompare(b.value)
        })
        .map(({ value, label }) => ({ value, label }))
}

export async function getCardFilterOptions(): Promise<CardFilterOptions> {
    const [sets, colors, rarities, types] = await Promise.all([
        getSetOptions(),
        prisma.card.findMany({ distinct: ["color"], select: { color: true } }),
        prisma.card.findMany({ distinct: ["rarity"], select: { rarity: true } }),
        prisma.card.findMany({ distinct: ["type"], select: { type: true } }),
    ])

    return {
        sets,
        colors: clean(colors.flatMap((c) => c.color?.split(";") ?? [])).sort(),
        rarities: clean(rarities.map((c) => c.rarity)).sort(),
        types: clean(types.map((c) => c.type)).sort(),
    }
}
