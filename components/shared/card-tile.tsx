"use client"

import Image from "next/image";
import { Card, CardContent } from "../ui/card";
import { useState, useTransition, type ReactNode } from "react";
import { Button } from "../ui/button";
import { useSession } from "next-auth/react";
import { updateCardQuantityAction } from "@/app/actions/updateCardQuantity.action";

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

export function CardTile(props: CardTileProps) {
  const imageSrc = props.image || "/card-placeholder.jpg";
  const quantity = props.quantity ?? 0
  const [isPending, startTransition] = useTransition();

  const { data: session } = useSession();
  const userId = session?.user?.id;

  function onUpdateQuantity(newCardQuantity: number): void {
    startTransition(async () => {
    
      if (userId != undefined) {
        await updateCardQuantityAction(userId, props.id, newCardQuantity)
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
        <div className="w-full overflow-hidden rounded-m pt-4">
          <Image 
            src={imageSrc} 
            alt={props.name} 
            className="h-full w-full object-cover"
            width={0}
            height={0}
            sizes="100vw"
            placeholder="blur"
            blurDataURL="/card-placeholder.jpg"
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
