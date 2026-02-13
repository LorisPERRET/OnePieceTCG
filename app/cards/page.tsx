import { getCardsPageDataAction } from "../actions/getCardsPageData.action";
import { getSearchParamNumber } from "@/lib/utils/getSearchParamNumber";
import { CardTile } from '@/components/shared/card-tile';
import { Pagination } from '@/components/shared/pagination';
import { SearchInput } from '@/components/shared/search';
import { AddCardDialog } from "./components/addCardDialog";

const PAGE_SIZE = 25;

interface CardsPageProps {
    searchParams: Promise<{
        page?: string;
        query?: string;
    }>;
}

export default async function CardsPage({ searchParams }: CardsPageProps) {
    const { page, query } = await searchParams;

    const paginated = await getCardsPageDataAction(
        getSearchParamNumber(page, 1),
        PAGE_SIZE,
        query
    );

    return (
        <div className="space-y-6">
            <SearchInput />

            {paginated.totalItems === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    Aucune carte trouvée.
                </div>
            ) : (
                <div className="grid grid-cols-5 gap-4">
                    {paginated.items.map((card) => (
                        <CardTile
                            key={card.id}
                            code={card.code}
                            name={card.name}
                            image={card.image}
                            id={card.id}
                            action={
                                <AddCardDialog cardId={card.id} />
                            }
                        />
                    ))}
                </div>
            )}

            <Pagination
                page={paginated.page}
                totalItems={paginated.totalItems}
                pageSize={25}
            />
        </div>
    );
}
