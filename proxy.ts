import { withAuth } from "next-auth/middleware"

export default withAuth({
    secret: process.env.NEXTAUTH_SECRET ?? "dev-only-secret-change-me",
    pages: {
        signIn: "/auth/signin"
    }
})

export const config = {
    matcher: ["/((?!api/auth|auth|_next/static|_next/image|favicon.ico|.*\\..*).*)"]
}
