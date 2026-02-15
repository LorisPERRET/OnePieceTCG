"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import { Package, ListChecks } from "lucide-react"
import { ReactNode } from "react"

interface NavItem {
    href: string;
    label: string;
    icon: ReactNode
}

const navItems: NavItem[] = [
    { href: "/cards", label: "Toutes les cartes", icon: <Package className="size-4" /> },
    { href: "/collection", label: "Ma collection", icon: <Package className="size-4" /> },
    { href: "/deck", label: "Deck builder", icon: <ListChecks className="size-4" /> }
]

export function TopNav() {
    const pathname = usePathname()
    const isAuthPage = pathname.startsWith("/auth")

    if (isAuthPage) {
        return null
    }

    const actives = navItems.filter(element => {
        return pathname.startsWith(element.href)
    })

    let active = "/cards"
    if (actives.length != 0) {
        active = actives[0].href
    }

    return (
        <Tabs value={active} className="w-full mt-4">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
                {navItems.map((item) => (
                    <TabsTrigger key={item.href}
                        value={item.href} asChild className="flex items-center gap-2">
                        <Link href={item.href}>
                            {item.icon}

                            {item.label}
                        </Link>
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    )
}
