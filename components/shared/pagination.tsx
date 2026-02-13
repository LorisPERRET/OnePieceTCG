"use client";

import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import Link from "next/link";
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { getParams } from "@/lib/utils/getParams";
import { range } from "@/lib/utils/range";

interface PaginationProps {
    page: number;
    totalItems: number;
    pageSize: number;
}

export function Pagination({
    page,
    totalItems,
    pageSize
}: PaginationProps) {

    const params = useSearchParams()

    const previousPage = page <= 1 ? 1 : page - 1
    const lastPage = Math.max(Math.ceil(totalItems / pageSize), 1)
    const nextPage = page >= lastPage ? lastPage : page + 1

    const firstItem = (page - 1) * pageSize + 1;
    const lastItem = Math.min(page * pageSize, totalItems);

    const canGoNext = page < lastPage
    const canGoPrevious = page > 1
    const canGoFirst = page > 1
    const canGoLast = page < lastPage

    const windowStart = Math.max(1, page - 2);
    const windowEnd = Math.min(lastPage, page + 2);
    const pages = range(windowStart, windowEnd);

    if (lastPage <= 1) {
        return (
            <div className="pager-wrap">
                <p className="pager-caption">{totalItems} elements</p>
            </div>
        );
    }

    return (
        <div className="pager-wrap">
            <p className="pager-caption">
                Affichage {firstItem}-{lastItem} sur {totalItems}
            </p>

            <nav className="pager" aria-label="Pagination">
                <Button
                    variant="outline"
                    className="pager-link lg:flex"
                    disabled={!canGoFirst}
                    asChild
                >
                    <Link href={getParams(params, 'page', '1')}>
                        <ChevronsLeftIcon className="size-4" />
                    </Link>
                </Button>

                <Button
                    variant="outline"
                    className="pager-link"
                    disabled={!canGoPrevious}
                    asChild
                >
                    <Link href={getParams(params, 'page', previousPage.toString())}>
                        <ChevronLeftIcon className="size-4" />
                    </Link>
                </Button>

                {windowStart > 1 && (
                    <>
                        <Link href={getParams(params, 'page', '1')} className="pager-link">
                            1
                        </Link>
                        {windowStart > 2 ? <span className="pager-ellipsis">...</span> : null}
                    </>
                )}

                {pages.map((pageNumber) => (
                    <Link
                        key={pageNumber}
                        href={getParams(params, 'page', pageNumber.toString())}
                        className={`pager-link ${pageNumber === page ? "is-active" : ""}`}
                        aria-current={pageNumber === page ? "page" : undefined}
                    >
                        {pageNumber}
                    </Link>
                ))}

                {windowEnd < lastPage && (
                    <>
                        {windowEnd < lastPage - 1 ? <span className="pager-ellipsis">...</span> : null}
                        <Link href={getParams(params, 'page', lastPage.toString())} className="pager-link">
                            {lastPage}
                        </Link>
                    </>
                )}

                <Button
                    variant="outline"
                    className="pager-link"
                    disabled={!canGoNext}
                    asChild
                >
                    <Link href={getParams(params, 'page', nextPage.toString())}>
                        <ChevronRightIcon className="size-4" />
                    </Link>
                </Button>

                <Button
                    variant="outline"
                    className="pager-link lg:flex"
                    disabled={!canGoLast}
                    asChild
                >
                    <Link href={getParams(params, 'page', lastPage.toString())}>
                        <ChevronsRightIcon className="size-4" />
                    </Link>
                </Button>
            </nav>
        </div>
    );
}
