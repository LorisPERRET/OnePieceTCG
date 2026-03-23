export type DeckCard = {
    quantity: number;
    code: string;
    name: string;
    images: string[];
    owned: number;
    missing: number;
}

export type ParseDeckResult = {
    leader: DeckCard[];
    main: DeckCard[];
}
