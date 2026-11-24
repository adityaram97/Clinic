import { NextResponse, type NextRequest } from "next/server";
import { doctorForRequest } from "@/lib/auth";
import { rejectCrossOrigin } from "@/lib/headers";
import { saveRecord } from "@/lib/records";
import { consultationSchema } from "@/lib/validation";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;
  const doctorId = await doctorForRequest(request);
  if (!doctorId)
    return NextResponse.json(
      { error: "Sign in to edit records." },
      { status: 401 },
    );
  const input: unknown = await request.json().catch(() => null);
  const parsed = consultationSchema.safeParse(input);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Check the patient, clinic, date, amount, and payment mode." },
      { status: 400 },
    );
  const { id } = await context.params;
  const record = await saveRecord(doctorId, parsed.data, id);
  if (!record)
    return NextResponse.json(
      { error: "Consultation record not found." },
      { status: 404 },
    );
  return NextResponse.json(record);
}
