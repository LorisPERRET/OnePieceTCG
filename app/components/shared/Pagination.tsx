'use client'

import type { ReadonlyURLSearchParams } from 'next/navigation'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from 'lucide-react'
import { Button } from '../ui/button'

type Props = {
  page: number
  totalItems: number
}

function getParams(
  params: ReadonlyURLSearchParams,
  parameterName: string,
  value: string,
): string {
  const newParams = new URLSearchParams(params)
  newParams.set(parameterName, value)
  return `?${newParams.toString()}`
}

export function Pagination({
  page,
  totalItems,
}: Props) {
  const params = useSearchParams()
  const router = useRouter()
  const pageSize = 25

  const previousPage = page <= 1 ? 1 : page - 1
  const lastPage = Math.max(Math.ceil(totalItems / pageSize), 1)
  const nextPage = page >= lastPage ? lastPage : page + 1

  const canGoNext = page < lastPage
  const canGoPrevious = page > 1
  const canGoFirst = page > 1
  const canGoLast = page < lastPage

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium">
        {totalItems} Cartes
      </p>
      <div className="flex items-center space-x-6 px-2 lg:space-x-8 gap-2">
        <p className="text-sm font-medium">
           { page } / { lastPage } 
        </p>
        <div className="flex items-center space-x-2 gap-1">
          <Button
            variant="outline"
            className="size-8 p-0 lg:flex"
            disabled={!canGoFirst}
            asChild
          >
            <Link href={getParams(params, 'page', '1')}>
              <ChevronsLeftIcon className="size-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            className="size-8 p-0"
            disabled={!canGoPrevious}
            asChild
          >
            <Link href={getParams(params, 'page', previousPage.toString())}>
              <ChevronLeftIcon className="size-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            className="size-8 p-0"
            disabled={!canGoNext}
            asChild
          >
            <Link href={getParams(params, 'page', nextPage.toString())}>
              <ChevronRightIcon className="size-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            className="size-8 p-0 lg:flex"
            disabled={!canGoLast}
            asChild
          >
            <Link href={getParams(params, 'page', lastPage.toString())}>
              <ChevronsRightIcon className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}