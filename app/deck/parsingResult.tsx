import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { DeckCard } from "@/lib/services/parseDeck";
import { CheckCircle2, ChevronDown, ChevronRight, XCircle } from "lucide-react";

interface ParsingResultProps {
  title: string;
  cards: DeckCard[];
}

export function ParsingResult(props: ParsingResultProps) {
    const [openedCardKey, setOpenedCardKey] = useState<string | null>(null);

    return (
        <div className="space-y-3">
            <h3 className="font-medium text-lg">{props.title}</h3>
            <div className="space-y-2">
            {props.cards.map((card, index) => {
                const cardKey = `${card.code}-${index}`;
                const contentId = `deck-card-preview-${cardKey}`;
                const isOpen = openedCardKey === cardKey;

                return (
                <div
                    key={cardKey}
                    className={`p-4 rounded-lg border ${
                        card.missing === 0 ? 'bg-green-50 border-green-200' : (card.owned === 0 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200')
                    }`}
                >
                    <button
                        type="button"
                        onClick={() => setOpenedCardKey(isOpen ? null : cardKey)}
                        aria-expanded={isOpen}
                        aria-controls={contentId}
                        className="w-full text-left gap-4"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    {card.missing === 0 ? (
                                    <CheckCircle2 className="size-4 text-green-600 flex-shrink-0" />
                                    ) : (
                                    <XCircle className="size-4 text-red-600 flex-shrink-0" />
                                    )}
                                    <span className="font-medium truncate">{card.name}</span>
                                    <Badge variant="outline" className="bg-white">
                                        {card.code}
                                    </Badge>
                                    {card.images.length > 0 ? (
                                        <>
                                        {isOpen ? (
                                        <ChevronRight className={`size-4 text-gray-600 transition-transform duration-300`} />
                                        ) : (
                                        <ChevronDown className={`size-4 text-gray-600 transition-transform duration-300`} />
                                        )}
                                        </>
                                    ) : (
                                        null
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <Badge variant={card.missing === 0 ? 'default' : 'destructive'}>
                                    {card.owned}/{card.quantity}
                                </Badge>
                                {card.missing > 0 && (
                                    <Badge variant="outline" className="bg-white">
                                        Manque: {card.missing}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {card.images && isOpen ? (
                            <>
                                {card.images.length > 0 ? (
                                    <div className="grid grid-cols-5 gap-4">
                                        {card.images.map((image) => (
                                            <div className="max-w-[220px] rounded-md overflow-hidden"
                                                    key={image}>
                                                <Image
                                                    src={image}
                                                    alt={card.name}
                                                    width={220}
                                                    height={307}
                                                    className="h-auto w-full object-cover pt-4"
                                                    placeholder="blur"
                                                    blurDataURL="/card-placeholder.jpg"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    
                                ) : (
                                    null
                                )}
                            </>
                        ) : (
                            null
                        )}
                    </button>
                </div>
                );
                })}
            </div>
        </div>
    )
}
