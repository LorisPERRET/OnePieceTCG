"use server"

import { parseDeck, ParseDeckResult } from "@/lib/services/parseDeck"
import { auth } from "@/lib/services/auth"

export async function parseDeckAction(
    input: string
): Promise<ParseDeckResult> {
    const session = await auth()
    if (!session?.user?.id) {
        return { leader: [], main: [] }
    }

    return parseDeck(input, session.user.id)
}
