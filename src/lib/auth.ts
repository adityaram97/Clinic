import { createHash, randomBytes, randomUUID } from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { doctors, sessions } from "@/lib/db/schema";

export const SESSION_COOKIE = "clinic_session";
const SESSION_DAYS = 14;

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(doctorId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiry = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();
  await db
    .delete(sessions)
    .where(lt(sessions.expiresAt, new Date().toISOString()));
  await db.insert(sessions).values({
    id: randomUUID(),
    doctorId,
    tokenHash: hashToken(token),
    expiresAt: expiry,
  });
  return { token, expiry };
}

export async function getDoctorForToken(token: string) {
  const [session] = await db
    .select({ id: doctors.id, expiresAt: sessions.expiresAt })
    .from(sessions)
    .innerJoin(doctors, eq(sessions.doctorId, doctors.id))
    .where(
      and(
        eq(sessions.tokenHash, hashToken(token)),
        gt(sessions.expiresAt, new Date().toISOString()),
      ),
    )
    .limit(1);
  return session?.id ?? null;
}

export async function currentDoctor() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  return token ? getDoctorForToken(token) : null;
}

export async function doctorForRequest(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  return token ? getDoctorForToken(token) : null;
}

export async function removeSession(token: string) {
  await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
}

export function assertSameOrigin(request: Request) {
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") return false;
  const origin = request.headers.get("origin");
  return !origin || new URL(origin).host === request.headers.get("host");
}
