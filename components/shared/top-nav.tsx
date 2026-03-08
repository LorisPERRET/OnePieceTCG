"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import { Package, ListChecks, Menu, X } from "lucide-react"
import { ReactNode, useState } from "react"
import { Button } from "../ui/button"

interface NavItem {
    href: string
    label: string
    icon: ReactNode
}

const navItems: NavItem[] = [
    { href: "/cards", label: "Toutes les cartes", icon: <Package className="size-4" /> },
    { href: "/collection", label: "Ma collection", icon: <Package className="size-4" /> },
    { href: "/deck", label: "Deck builder", icon: <ListChecks className="size-4" /> }
]

export function TopNav() {
    const pathname = usePathname()
    const [menuOpen, setMenuOpen] = useState(false)
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
    const activeIndex = navItems.findIndex((item) => item.href === active)

    return (
        <nav className="w-full mt-4">
            <div className="sm:hidden container mx-auto px-4">
                <div className="flex justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Ouvrir le menu"
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen((prev) => !prev)}
                    >
                        <span className="relative size-4">
                            <Menu
                                className={`absolute inset-0 size-4 transition-all duration-200 ${
                                    menuOpen ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
                                }`}
                            />
                            <X
                                className={`absolute inset-0 size-4 transition-all duration-200 ${
                                    menuOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
                                }`}
                            />
                        </span>
                    </Button>
                </div>
                {menuOpen ? (
                    <div className="mt-3 rounded-lg border bg-white p-2 shadow-sm">
                        <div className="flex flex-col gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMenuOpen(false)}
                                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                                        active === item.href ? "bg-accent text-accent-foreground" : "hover:bg-accent"
                                    }`}
                                >
                                    {item.icon}
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>

            <div className="hidden sm:block">
                <Tabs value={active} className="w-full">
                    <TabsList className="relative grid w-full max-w-xl mx-auto grid-cols-3">
                        <span
                            className="absolute inset-y-[3px] left-[3px] rounded-lg bg-white shadow-xs transition-transform duration-300 ease-out"
                            style={{
                                width: "calc((100% - 6px) / 3)",
                                transform: `translateX(${Math.max(activeIndex, 0) * 100}%)`,
                            }}
                            aria-hidden
                        />
                        {navItems.map((item) => (
                            <TabsTrigger
                                key={item.href}
                                value={item.href}
                                asChild
                                className="relative !h-full flex items-center gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                <Link href={item.href} className="flex items-center gap-2">
                                    {item.icon}
                                    {item.label}
                                </Link>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>
        </nav>
    )
}