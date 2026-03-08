import "dotenv/config"
import prisma from "../lib/prisma"

type ApiCard = {
    id: string;
    code: string;
    rarity?: string | null;
    type?: string | null;
    name: string;
    images: {
        small?: string | null;
        large?: string | null;
    };
    cost?: number | null;
    attribute?: {
        name?: string | null;
        image?: string | null;
    } | null;
    power?: number | string | null;
    counter?: string | null;
    color?: string | null;
    family?: string | null;
    ability?: string | null;
    trigger?: string | null;
    set?: {
        name?: string | null;
    } | null;
};

type ApiResponse = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    data: ApiCard[];
};

const API_URL = "https://apitcg.com/api/one-piece/cards"
const API_KEY = process.env.API_TCG_KEY

function toNullableInt(value: number | string | null | undefined): number | null {
    if (value === null || value === undefined) {
        return null
    }

    const parsed = typeof value === "number" ? value : Number(value)
    return Number.isFinite(parsed) ? parsed : null
}

async function fetchPage(page: number): Promise<ApiResponse> {
    if (!API_KEY) {
        throw new Error("Missing APITCG_API_KEY")
    }

    const url = new URL(API_URL)
    url.searchParams.set("page", String(page))
    url.searchParams.set("limit", String(100))

    const res = await fetch(url.toString(), {
        headers: {
            "x-api-key": `${API_KEY}`,
        },
    })

    if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(`APITCG error ${res.status}: ${text}`)
    }

    return (await res.json()) as ApiResponse
}

async function main() {
    const first = await fetchPage(1)
    const cards: ApiCard[] = [...first.data]
    const totalPages = first.totalPages || 1

    for (let page = 2; page <= totalPages; page += 1) {
        const next = await fetchPage(page)
        cards.push(...next.data)
    }

    if (!cards.length) {
        console.log("[sync] no cards received")
        return
    }

    console.log(`[sync] received ${cards.length} cards`)

    const operations = cards.map((card) =>
        prisma.card.upsert({
            where: { id: card.id },
            update: {
                code: card.code,
                rarity: card.rarity ?? null,
                type: card.type ?? null,
                name: card.name,
                image: card.images.small || "",
                cost: toNullableInt(card.cost),
                attributeName: card.attribute?.name ?? null,
                attributeImage: card.attribute?.image ?? null,
                power: toNullableInt(card.power),
                counter: card.counter ?? null,
                color: card.color ?? null,
                family: card.family ?? null,
                ability: card.ability ?? null,
                trigger: card.trigger ?? null,
                setName: card.set?.name ?? null,
                raw: card,
            },
            create: {
                id: card.id,
                code: card.code,
                rarity: card.rarity ?? null,
                type: card.type ?? null,
                name: card.name,
                image: card.images.small || "",
                cost: toNullableInt(card.cost),
                attributeName: card.attribute?.name ?? null,
                attributeImage: card.attribute?.image ?? null,
                power: toNullableInt(card.power),
                counter: card.counter ?? null,
                color: card.color ?? null,
                family: card.family ?? null,
                ability: card.ability ?? null,
                trigger: card.trigger ?? null,
                setName: card.set?.name ?? null,
                raw: card,
            },
        })
    )

    await prisma.$transaction(operations)
    console.log("[sync] upsert complete")
}

main()
    .catch((err) => {
        console.error("[sync] failed", err)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })