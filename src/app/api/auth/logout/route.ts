import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { removeSession, SESSION_COOKIE } from "@/lib/auth";
import { rejectCrossOrigin } from "@/lib/headers";

export async function POST(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await removeSession(token);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
