"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useTransition } from "react"
import { deleteCardFromCollectionAction } from "../../actions/deleteCardFromCollection.action"
import { markCollectionUpdated } from "@/lib/utils/collectionSync"

interface DeleteCardButtonProps {
    cardId: string;
}

export function DeleteCardButton(options: DeleteCardButtonProps) {
    const [, startTransition] = useTransition()

    const { data: session } = useSession()
    const userId = session?.user?.id

    function onDeleteCard(id: string): void {
        startTransition(async () => {

            if (userId != undefined) {
                const result = await deleteCardFromCollectionAction(userId, id)
                if (result.success) {
                    markCollectionUpdated()
                }
            }
        })
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
    )
}
