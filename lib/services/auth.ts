import { PrismaAdapter } from "@auth/prisma-adapter"
import type { NextAuthOptions } from "next-auth"
import { getServerSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import prisma from "@/lib/prisma"

const nextAuthSecret = process.env.NEXTAUTH_SECRET

if (process.env.NODE_ENV === "production" && !nextAuthSecret) {
    throw new Error("Missing NEXTAUTH_SECRET in production")
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    secret: nextAuthSecret,
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: "/auth/signin"
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
        })
    ],
    callbacks: {
        async signIn({ user }) {
            if (!user.email) {
                return true
            }

            return true
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub
            }
            return session
        }
    }
}

export function auth() {
    return getServerSession(authOptions)
}
