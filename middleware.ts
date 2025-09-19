import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

const PUBLIC_PATHS = ["/login", "/register", "/public"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("auth_token")?.value;

  console.log("Middleware is running...");
  console.log(`Checking path: ${pathname}`);
  console.log(`Token found: ${!!token}`); // Logs 'true' or 'false'

  // 1. If the user is on a public path, let them continue.
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 2. If there's no token, redirect to the login page.
  if (!token) {
    console.log("No token found. Redirecting to /login.");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 3. If a token exists, verify it to ensure it's valid.
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    jose.jwtVerify(token, secret);
    // If verification succeeds, continue to the requested page.
    console.log("Token is valid. Continuing to page.");
    return NextResponse.next();
  } catch (err) {
    // 4. If verification fails, it means the token is invalid, so redirect to login.
    console.error("JWT verification failed:", err);
    console.log("Redirecting to /login due to invalid token.");
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  // The middleware will only run for these paths.
  matcher: ["/dashboard/:path*", "/profile/:path*", "/api/protected/:path*"],
};
