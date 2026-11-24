import { NextResponse, type NextRequest } from "next/server";
import { doctorForRequest } from "@/lib/auth";
import { rejectCrossOrigin } from "@/lib/headers";
import { listRecords, saveRecord } from "@/lib/records";
import { consultationSchema, isoDateSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const doctorId = await doctorForRequest(request);
  if (!doctorId)
    return NextResponse.json(
      { error: "Sign in to view records." },
      { status: 401 },
    );
  const params = new URL(request.url).searchParams;
  const page = Number(params.get("page") ?? "1");
  const mode = params.get("mode");
  const from = params.get("from") ?? undefined;
  const to = params.get("to") ?? undefined;
  const search = params.get("search")?.slice(0, 120) ?? undefined;
  if (
    !Number.isInteger(page) ||
    page < 1 ||
    page > 10000 ||
    (mode !== null && mode !== "cash" && mode !== "digital") ||
    (from && !isoDateSchema.safeParse(from).success) ||
    (to && !isoDateSchema.safeParse(to).success) ||
    (from && to && from > to)
  ) {
    return NextResponse.json(
      { error: "Check your filters and try again." },
      { status: 400 },
    );
  }
  return NextResponse.json(
    await listRecords({
      doctorId,
      from,
      to,
      mode: mode ?? undefined,
      search,
      page,
    }),
  );
}

export async function POST(request: NextRequest) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;
  const doctorId = await doctorForRequest(request);
  if (!doctorId)
    return NextResponse.json(
      { error: "Sign in to save a record." },
      { status: 401 },
    );
  const input: unknown = await request.json().catch(() => null);
  const parsed = consultationSchema.safeParse(input);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Check the patient, clinic, date, amount, and payment mode." },
      { status: 400 },
    );
  const record = await saveRecord(doctorId, parsed.data);
  return NextResponse.json(record, { status: 201 });
}
