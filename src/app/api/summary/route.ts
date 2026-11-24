import { NextResponse, type NextRequest } from "next/server";
import { doctorForRequest } from "@/lib/auth";
import { getRevenueSummary } from "@/lib/records";
import { isoDateSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const doctorId = await doctorForRequest(request);
  if (!doctorId)
    return NextResponse.json(
      { error: "Sign in to view revenue." },
      { status: 401 },
    );
  const date =
    new URL(request.url).searchParams.get("date") ??
    new Date().toISOString().slice(0, 10);
  if (!isoDateSchema.safeParse(date).success) {
    return NextResponse.json(
      { error: "Choose a valid date." },
      { status: 400 },
    );
  }
  return NextResponse.json(await getRevenueSummary(doctorId, date));
}
