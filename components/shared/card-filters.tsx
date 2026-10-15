"use client"

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, ChevronDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CARD_FILTER_KEYS } from '@/lib/utils/cardFilters'
import type { CardFilterOptions, SetOption } from '@/lib/services/getCardFilterOptions'

type MultiSelectProps = {
    label: string;
    values: (string | SetOption)[];
    selected: string[];
    onChange: (selected: string[]) => void;
}

function MultiSelect({ label, values, selected, onChange }: MultiSelectProps) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const listRef = useRef<HTMLDivElement>(null)
    const scrollTop = useRef(0)

    useEffect(() => {
        const close = (e: MouseEvent) => {
            if (!ref.current?.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener("mousedown", close)
        return () => document.removeEventListener("mousedown", close)
    }, [])

    // La navigation recrée le rendu à chaque case cochée : on garde la position de scroll
    useLayoutEffect(() => {
        if (listRef.current) listRef.current.scrollTop = scrollTop.current
    }, [selected.length, open])

    const toggle = (value: string) => {
        scrollTop.current = listRef.current?.scrollTop ?? 0
        onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])
    }

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
                className="flex h-9 items-center gap-2 rounded-md border border-input bg-input-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
                {label}
                {selected.length > 0 && (
                    <span
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: 20,
                            height: 20,
                            padding: "0 6px",
                            borderRadius: 9999,
                            background: "#030213",
                            color: "#ffffff",
                            fontSize: 12,
                            fontWeight: 600,
                            lineHeight: 1,
                        }}
                    >
                        {selected.length}
                    </span>
                )}
                <ChevronDown className="size-4 text-gray-400" />
            </button>

            {open && (
                <div
                    ref={listRef}
                    onScroll={(e) => { scrollTop.current = e.currentTarget.scrollTop }}
                    style={{
                        maxHeight: 256,
                        overflowY: "auto",
                        overscrollBehavior: "contain",
                        border: "1px solid #d1d5db",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.15)",
                    }}
                    className="absolute left-0 top-full z-20 mt-1 w-max min-w-48 max-w-[90vw] rounded-lg bg-background p-1">
                    {values.map((option) => {
                        const { value, label: optionLabel } = typeof option === "string" ? { value: option, label: option } : option
                        return (
                        <label
                            key={value}
                            className="relative flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent"
                        >
                            <input
                                type="checkbox"
                                checked={selected.includes(value)}
                                onChange={() => toggle(value)}
                                style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
                            />
                            <span
                                aria-hidden
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    width: 18,
                                    height: 18,
                                    borderRadius: 5,
                                    border: `1.5px solid ${selected.includes(value) ? "#030213" : "#9ca3af"}`,
                                    background: selected.includes(value) ? "#030213" : "#ffffff",
                                    color: "#ffffff",
                                    transition: "background 120ms, border-color 120ms",
                                }}
                            >
                                {selected.includes(value) && <Check size={13} strokeWidth={3} />}
                            </span>
                            <span className="whitespace-nowrap">{optionLabel}</span>
                        </label>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export function CardFilters({ options }: { options: CardFilterOptions }) {
    const params = useSearchParams()
    const router = useRouter()

    const filters = [
        { key: "set", label: "Sets", values: options.sets },
        { key: "color", label: "Couleurs", values: options.colors },
        { key: "rarity", label: "Raretés", values: options.rarities },
        { key: "type", label: "Types", values: options.types },
    ]

    const hasFilters = CARD_FILTER_KEYS.some((key) => params.has(key))

    const update = (updates: Record<string, string[]>) => {
        const newParams = new URLSearchParams(params)
        newParams.set("page", "1")
        for (const [key, values] of Object.entries(updates)) {
            newParams.delete(key)
            values.forEach((value) => newParams.append(key, value))
        }
        router.push(`?${newParams.toString()}`)
    }

    return (
        <>
            {filters.map(({ key, label, values }) => (
                <MultiSelect
                    key={key}
                    label={label}
                    values={values}
                    selected={params.getAll(key)}
                    onChange={(selected) => update({ [key]: selected })}
                />
            ))}

            {hasFilters && (
                <Button
                    variant="ghost"
                    onClick={() => update(Object.fromEntries(CARD_FILTER_KEYS.map((key) => [key, []])))}
                >
                    <X className="size-4" />
                    Réinitialiser
                </Button>
            )}
        </>
    )
}
