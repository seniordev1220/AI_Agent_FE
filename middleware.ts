import { getToken } from "next-auth/jwt"
import { type NextRequest, NextResponse } from "next/server"

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // Define paths that are considered public (no auth required)
  const publicPaths = ["/", "/sign-in", "/terms", "/privacy", "public"]
  const isPublicPath = publicPaths.includes(path) || 
    path.startsWith("/api/auth") || 
    path.startsWith("/embed") ||  // Allow embed routes without auth
    path.includes(".")

  // Get the session token
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Redirect logic
  if (!token && !isPublicPath) {
    // Redirect to sign-in if trying to access a protected route without a token
    return NextResponse.redirect(new URL("/sign-in", req.url))
  } else if (token && (path === "/sign-in" || path === "/")) {
    // Redirect to dashboard if already signed in and trying to access sign-in or home page
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
