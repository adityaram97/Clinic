import { authResponse, readCredentials } from "@/lib/auth-response";
import { verifyDoctor } from "@/lib/credentials";
import { createSession, SESSION_COOKIE } from "@/lib/auth";
import { rejectCrossOrigin } from "@/lib/headers";

export async function POST(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;
  const input = await readCredentials(request);
  const doctor = await verifyDoctor(input);
  if (!doctor) {
    return authResponse(request, { error: "Invalid email or password." }, 401);
  }
  const session = await createSession(doctor.id);
  const response = authResponse(request, { ok: true }, 200);
  response.cookies.set(SESSION_COOKIE, session.token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(session.expiry),
  });
  return response;
}
