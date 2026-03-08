"use client"

import Image from "next/image"
import { usePathname } from "next/navigation"

export function TopHeader() {
    const pathname = usePathname()
    const isAuthPage = pathname.startsWith("/auth")

    if (isAuthPage) {
        return null
    }

    return (
        <header 
            className="background-primary border-b sticky top-0 z-10"
        >
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-stretch gap-4">
                    <Image src={"/icon.svg"} alt="icon" width={100} height={100} className="rounded-lg"/>
                    <div className="flex flex-col justify-center py-1">
                        <h1 className="text-2xl font-bold text-white">
                            One Piece Card Manager
                        </h1>
                        <p className="text-sm text-white font-semibold">
                            Gérez votre collection et analysez vos decks
                        </p>
                    </div>
                </div>
            </div>
        </header>
    )
}