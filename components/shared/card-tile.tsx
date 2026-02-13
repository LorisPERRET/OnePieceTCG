"use client"

import Image from "next/image";
import { Card, CardContent } from "../ui/card";
import { useTransition, type ReactNode } from "react";
import { Button } from "../ui/button";
import { useSession } from "next-auth/react";
import { updateCardQuantityAction } from "@/app/actions/updateCardQuantity.action";
import { markCollectionUpdated } from "@/lib/utils/collectionSync";

interface CardTileProps {
    id: string;
    code: string;
    name: string;
    image: string;
    quantity?: number;
    footerLabel?: string;
    status?: "owned" | "partial" | "missing";
    action?: ReactNode;
}

const CARD_BLUR_PLACEHOLDER =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMzYwJyBoZWlnaHQ9JzUwNCcgdmlld0JveD0nMCAwIDM2MCA1MDQnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHJlY3Qgd2lkdGg9JzM2MCcgaGVpZ2h0PSc1MDQnIGZpbGw9JyNlNWU3ZWInLz48L3N2Zz4=";

export function CardTile(props: CardTileProps) {
    const imageSrc = props.image || "/card-placeholder.jpg";
    const quantity = props.quantity ?? 0
    const [, startTransition] = useTransition();

    const { data: session } = useSession();
    const userId = session?.user?.id;

    function onUpdateQuantity(newCardQuantity: number): void {
        startTransition(async () => {

            if (userId != undefined) {
                const result = await updateCardQuantityAction(userId, props.id, newCardQuantity)
                if (result.success) {
                    markCollectionUpdated();
                }
            }
        });
    }

    return (
        <Card key={props.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{props.name}</h3>
                        <p className="text-sm text-gray-500">{props.code}</p>
                    </div>
                    {props.action ? <div className="shrink-0">{props.action}</div> : null}
                </div>
                <div className="w-full overflow-hidden rounded-md pt-4">
                    <Image
                        src={imageSrc}
                        alt={props.name}
                        className="h-full w-full object-cover"
                        width={360}
                        height={504}
                        sizes="(max-width: 768px) 100vw, 320px"
                        placeholder="blur"
                        blurDataURL={CARD_BLUR_PLACEHOLDER}
                    />
                </div>
                {quantity !== 0 ? (
                    <div className="flex items-center gap-2 mt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateQuantity(Math.max(1, quantity - 1))}
                            disabled={quantity <= 1}
                        >
                            -
                        </Button>
                        <div className="flex-1 text-center">
                            <span className="font-medium">{quantity}</span>
                            <span className="text-sm text-gray-500 ml-1">
                                {quantity > 1 ? 'exemplaires' : 'exemplaire'}
                            </span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateQuantity(quantity + 1)}
                        >
                            +
                        </Button>
                    </div>
                ) : null
                }
            </CardContent>
        </Card>
    );
}
