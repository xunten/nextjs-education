// /app/api/auth/set-role/route.ts
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { encode } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  const { role } = await req.json();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Cập nhật role vào token (trên server)
  const newToken = { ...token, role };

  // Tạo cookie mới chứa token đã cập nhật
  const newJwt = await encode({
    token: newToken,
    secret: process.env.NEXTAUTH_SECRET!,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("next-auth.session-token", newJwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });

  return res;
}
