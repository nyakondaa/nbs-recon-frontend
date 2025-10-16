// app/api/user/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get("auth_token")?.value;
  if (!cookie) return NextResponse.json(null);

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jose.jwtVerify(cookie, secret);
    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json(null);
  }
}
