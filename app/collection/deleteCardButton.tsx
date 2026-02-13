"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTransition } from "react";
import { deleteCardFromCollectionAction } from "../actions/deleteCardFromCollection.action";

interface DeleteCardButtonProps {
    cardId: string;
}

export function DeleteCardButton(options: DeleteCardButtonProps) {
        const [isPending, startTransition] = useTransition();
    
        const { data: session } = useSession();
        const userId = session?.user?.id;

        function onDeleteCard(id: any): void {
                startTransition(async () => {
        
                        if (userId != undefined) {
                                await deleteCardFromCollectionAction(userId, id)
                        }
                });
        }

        return (
                <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteCard(options.cardId)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                        <Trash2 className="size-4" />
                </Button>
        );
}
