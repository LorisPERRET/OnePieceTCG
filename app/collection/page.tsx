import { auth } from "@/lib/services/auth";
import { redirect } from "next/navigation";
import { getCollectionPageDataAction } from "../actions/getCollectionPageData.action";
import { getSearchParamNumber } from "@/lib/utils/getSearchParamNumber";
import { CardTile } from '@/components/shared/card-tile';
import { Pagination } from '@/components/shared/pagination';
import { SearchInput } from '@/components/shared/search';
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { DeleteCardButton } from "./components/deleteCardButton";

const PAGE_SIZE = 25;

interface CollectionPageProps {
    searchParams: Promise<{
        page?: string;
        query?: string;
    }>;
}

export default async function CollectionPage({ searchParams }: CollectionPageProps) {
    const { page, query } = await searchParams;
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/auth/signin");
    }

    const paginated = await getCollectionPageDataAction(
        session.user.id,
        getSearchParamNumber(page, 1),
        PAGE_SIZE,
        query,
    );

    return (
        <div className="flex h-full flex-1 flex-col gap-6">
            <SearchInput />

            {paginated.totalItems === 0 ? (
                <div className="flex flex-1 items-center justify-center text-center text-gray-500">
                    Aucune carte trouvée dans votre collection.
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-5 gap-4">
                        {paginated.items.map(({ card, quantity }) => (
                            <CardTile
                                id={card.id}
                                key={card.id}
                                code={card.code}
                                name={card.name}
                                image={card.image}
                                quantity={quantity}
                                action={
                                    <DeleteCardButton cardId={card.id} />
                                }
                            />
                        ))}
                    </div>

                    <Pagination
                        page={paginated.page}
                        totalItems={paginated.totalItems}
                        pageSize={25}
                    />
                </>
            )}
        </div>
    );
}
