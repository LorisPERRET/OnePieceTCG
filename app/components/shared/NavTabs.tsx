"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import { Package, ListChecks } from "lucide-react"

export function NavTabs() {
  const pathname = usePathname()

  // valeur active en fonction de l’URL
  const active =
    pathname.startsWith("/collection") ? "collection"
    : pathname.startsWith("/deck") ? "deck"
    : "cards"

  return (
    <Tabs value={active} className="w-full">
      <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
        <TabsTrigger value="cards" asChild className="flex items-center gap-2">
          <Link href="/cards">
            <Package className="size-4" />
            Toutes les cartes
          </Link>
        </TabsTrigger>

        <TabsTrigger value="collection" asChild className="flex items-center gap-2">
          <Link href="/collection">
            <Package className="size-4" />
            Ma Collection
          </Link>
        </TabsTrigger>

        <TabsTrigger value="deck" asChild className="flex items-center gap-2">
          <Link href="/deck">
            <ListChecks className="size-4" />
            Analyser un Deck
          </Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}