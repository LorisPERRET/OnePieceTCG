import { getCardsAction } from "@/app/actions/getCards.action";
import { AllCardPage } from "@/app/components/pages/AllCardPage";
import { getSearchParamNumber } from "@/lib/utils/getSearchParamNumber";

type PageProps = {
  searchParams: Promise<{
    page?: string;
    query?: string;
  }>;
};

export default async function Cards({ searchParams }: PageProps) {
  const { page, query } = await searchParams;
  const pageIndex = getSearchParamNumber(page, 1)
  const result = await getCardsAction(pageIndex, 25, query);

  return (
    <AllCardPage cards={result.data} page={pageIndex} totalItems={result.total}/>
  );
}