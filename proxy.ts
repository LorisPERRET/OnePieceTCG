import { withAuth } from "next-auth/middleware"

const nextAuthSecret = process.env.NEXTAUTH_SECRET

if (process.env.NODE_ENV === "production" && !nextAuthSecret) {
    throw new Error("Missing NEXTAUTH_SECRET in production")
}

export default withAuth({
    secret: nextAuthSecret,
    pages: {
        signIn: "/auth/signin"
    }
})

export const config = {
    matcher: ["/((?!api/auth|auth|_next/static|_next/image|favicon.ico|.*\\..*).*)"]
}
