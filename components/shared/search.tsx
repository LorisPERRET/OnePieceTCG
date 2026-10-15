"use client"

import { Search } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import type { ReactNode } from 'react'
import { Input } from '@/components/ui/input'

export function SearchInput({ children }: { children?: ReactNode }) {
    const params = useSearchParams()
    const router = useRouter()

    const handleQuery = useDebouncedCallback((query: string) => {
        const newParams = new URLSearchParams(params)
        newParams.set("page", "1")
        if (query) {
            newParams.set('query', query)
        } else {
            newParams.delete('query')
        }
        router.push(`?${newParams.toString()}`)
    }, 200)

    return (
        <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                    type="text"
                    placeholder="Rechercher une carte..."
                    defaultValue={params.get('query') ?? ""}
                    onChange={(e) => handleQuery(e.target.value)}
                    className="pl-10"
                />
            </div>
            {children}
        </div>
    )
}
