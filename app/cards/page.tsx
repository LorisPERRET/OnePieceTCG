import { getCardsPageDataAction } from "../actions/getCardsPageData.action"
import { getSearchParamNumber } from "@/lib/utils/getSearchParamNumber"
import { CardTile } from '@/components/shared/card-tile'
import { Pagination } from '@/components/shared/pagination'
import { SearchInput } from '@/components/shared/search'
import { parseCardFilters } from '@/lib/utils/cardFilters'
import { CardFilters } from '@/components/shared/card-filters'
import { getCardFilterOptions } from '@/lib/services/getCardFilterOptions'
import { AddCardDialog } from "./components/addCardDialog"

const PAGE_SIZE = 50

interface CardsPageProps {
    searchParams: Promise<{
        page?: string;
        query?: string;
        set?: string | string[];
        color?: string | string[];
        rarity?: string | string[];
        type?: string | string[];
    }>;
}

export default async function CardsPage({ searchParams }: CardsPageProps) {
    const params = await searchParams
    const { page, query } = params
    const filters = parseCardFilters(params)
    const filterOptions = await getCardFilterOptions()

    const paginated = await getCardsPageDataAction(
        getSearchParamNumber(page, 1),
        PAGE_SIZE,
        query,
        filters
    )

    return (
        <div className="space-y-6">
            <SearchInput>
                <CardFilters options={filterOptions} />
            </SearchInput>

            {paginated.totalItems === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    Aucune carte trouvée.
                </div>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
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
                pageSize={PAGE_SIZE}
            />
        </div>
    )
}
