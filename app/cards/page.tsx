import { getCardsPageDataAction } from "../actions/getCardsPageData.action";
import { getSearchParamNumber } from "@/lib/utils/getSearchParamNumber";
import { CardsClient } from "./cards-client";

const PAGE_SIZE = 25;
export const dynamic = "force-dynamic";

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

  return <CardsClient cards={paginated.items} page={paginated.page} totalItems={paginated.totalItems} />;
}
