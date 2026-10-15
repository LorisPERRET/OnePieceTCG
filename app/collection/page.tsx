import { auth } from "@/lib/services/auth"
import { redirect } from "next/navigation"
import { getCollectionPageDataAction } from "../actions/getCollectionPageData.action"
import { getSearchParamNumber } from "@/lib/utils/getSearchParamNumber"
import { CardTile } from '@/components/shared/card-tile'
import { Pagination } from '@/components/shared/pagination'
import { SearchInput } from '@/components/shared/search'
import { parseCardFilters } from '@/lib/utils/cardFilters'
import { CardFilters } from '@/components/shared/card-filters'
import { getCardFilterOptions } from '@/lib/services/getCardFilterOptions'
import { DeleteCardButton } from "./components/deleteCardButton"

const PAGE_SIZE = 50

interface CollectionPageProps {
    searchParams: Promise<{
        page?: string;
        query?: string;
        set?: string | string[];
        color?: string | string[];
        rarity?: string | string[];
        type?: string | string[];
    }>;
}

export default async function CollectionPage({ searchParams }: CollectionPageProps) {
    const params = await searchParams
    const { page, query } = params
    const filters = parseCardFilters(params)
    const filterOptions = await getCardFilterOptions()
    const session = await auth()

    if (!session?.user?.id) {
        redirect("/auth/signin")
    }

    const paginated = await getCollectionPageDataAction(
        session.user.id,
        getSearchParamNumber(page, 1),
        PAGE_SIZE,
        query,
        filters,
    )

    return (
        <div className="flex h-full flex-1 flex-col gap-6">
            <SearchInput>
                <CardFilters options={filterOptions} />
            </SearchInput>

            {paginated.totalItems === 0 ? (
                <div className="flex flex-1 items-center justify-center text-center text-gray-500">
                    Aucune carte trouvée dans votre collection.
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
                        {paginated.items.map(({ card, quantity }) => (
                            <CardTile
                                id={card.id}
                                key={card.id}
                                code={card.code}
                                name={card.name}
                                image={card.image}
                                quantity={quantity}
                                action={
                                    <DeleteCardButton cardId={card.id} cardName={card.name} />
                                }
                            />
                        ))}
                    </div>

                    <Pagination
                        page={paginated.page}
                        totalItems={paginated.totalItems}
                        pageSize={PAGE_SIZE}
                    />
                </>
            )}
        </div>
    )
}
