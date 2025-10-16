import { cookies } from "next/headers";
import * as jose from "jose";

export async function getLoggedInUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jose.jwtVerify(token, secret);

 
    return payload;

  } catch (err: any) {
    console.error("JWT verification failed:", err.name, err.message);
    return null;
  }
}
