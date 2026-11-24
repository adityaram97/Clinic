import { authResponse, readCredentials } from "@/lib/auth-response";
import { createDoctor } from "@/lib/credentials";
import { createSession, SESSION_COOKIE } from "@/lib/auth";
import { rejectCrossOrigin } from "@/lib/headers";
import { credentialsSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;
  const input = await readCredentials(request);
  const parsed = credentialsSchema.safeParse(input);
  if (!parsed.success) {
    return authResponse(
      request,
      {
        error: "Enter a valid email and a password of at least 10 characters.",
      },
      400,
    );
  }
  const result = await createDoctor(parsed.data);
  if (!result.ok) {
    return authResponse(
      request,
      { error: result.error },
      409,
      "account_exists",
    );
  }
  const session = await createSession(result.doctorId);
  const response = authResponse(request, { ok: true }, 201);
  response.cookies.set(SESSION_COOKIE, session.token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(session.expiry),
  });
  return response;
}
