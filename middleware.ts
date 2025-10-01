import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

const PUBLIC_PATHS = ["/login", "/register", "/public"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("auth_token")?.value;

  console.log("Middleware is running...");
  console.log(`Checking path: ${pathname}`);
  console.log(`Token found: ${!!token}`);

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // If no token, redirect
  if (!token) {
    console.log("No token found. Redirecting to /login.");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jose.jwtVerify(token, secret); // ✅ await is required
    console.log("Token is valid. Continuing to page.");
    return NextResponse.next();
  } catch (err: any) {
    console.error("JWT verification failed:", err.name, err.message);
    // Clear cookie if token is expired or invalid
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.set("auth_token", "", { maxAge: 0 });
    return res;
  }
}

export const config = {
  matcher: [
    '/', // ← Add this
    '/dashboard/:path*',
    '/profile/:path*',
    '/api/protected/:path*',
  ],
};