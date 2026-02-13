import { parseDeck, ParseDeckResult } from "@/lib/services/parseDeck"

export async function parseDeckAction(
    input: string,
    userId: string
): Promise<ParseDeckResult> {
    return parseDeck(input, userId)
}