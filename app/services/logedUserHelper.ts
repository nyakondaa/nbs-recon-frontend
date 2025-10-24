import { cookies } from "next/headers";
import * as jose from "jose";

export async function getLoggedInUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload, protectedHeader } = await jose.jwtVerify(token, secret);

    // Check expiration manually just in case
    const currentTime = Math.floor(Date.now() / 1000); // current time in seconds
    if (payload.exp && currentTime >= payload.exp) {
      console.warn("JWT has expired");
      // Remove cookie if you want to auto-logout
      cookieStore.delete("auth_token");
      return null;
    }

    // Optionally, you can check issuedAt (iat) and other claims
    if (payload.iat && currentTime < payload.iat) {
      console.warn("JWT iat is in the future, possible clock mismatch");
      return null;
    }

    // Everything OK, return payload
    return payload;

  } catch (err: any) {
    console.error("JWT verification failed:", err.name, err.message);
    // Token invalid, remove cookie to force logout
    cookieStore.delete("auth_token");
    return null;
  }
}
