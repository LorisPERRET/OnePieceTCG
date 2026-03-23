"use server"

import { auth } from "@/lib/services/auth"
import { parseDeck } from "@/lib/services/parseDeck"
import { ParseDeckResult } from "@/lib/types/deck"

export async function parseDeckAction(
    input: string
): Promise<ParseDeckResult> {
    const session = await auth()
    if (!session?.user?.id) {
        return { leader: [], main: [] }
    }

    return parseDeck(input, session.user.id)
}
