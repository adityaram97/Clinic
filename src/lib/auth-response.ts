import { NextResponse } from "next/server";

export async function readCredentials(request: Request): Promise<unknown> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return request.json().catch(() => null);
  }
  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData = await request.formData().catch(() => null);
    return formData
      ? {
          email: formData.get("email"),
          password: formData.get("password"),
        }
      : null;
  }
  return null;
}

export function authResponse(
  request: Request,
  payload: { ok?: boolean; error?: string },
  status: number,
  errorCode = "invalid",
) {
  if (request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(payload, { status });
  }

  if (status < 400) {
    return new NextResponse(null, {
      status: 303,
      headers: { Location: "/" },
    });
  }

  const isSetup = new URL(request.url).pathname.endsWith("/setup");
  const destination =
    status === 409 && isSetup ? "/login" : isSetup ? "/setup" : "/login";
  const errorQuery = new URLSearchParams({ error: errorCode });
  return new NextResponse(null, {
    status: 303,
    headers: { Location: `${destination}?${errorQuery}` },
  });
}
