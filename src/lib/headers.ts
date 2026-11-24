import { NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/auth";

export function rejectCrossOrigin(request: Request) {
  if (assertSameOrigin(request)) return null;
  return NextResponse.json(
    { error: "Cross-site request blocked." },
    { status: 403 },
  );
}
