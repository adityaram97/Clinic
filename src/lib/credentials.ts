import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { doctors } from "@/lib/db/schema";
import { credentialsSchema } from "@/lib/validation";

const DUMMY_PASSWORD_HASH = bcrypt.hashSync("not-a-real-doctor-password", 12);

export async function createDoctor(input: unknown) {
  const parsed = credentialsSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false as const, error: "Check your email and password." };
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const [doctor] = await db
    .insert(doctors)
    .values({
      id: randomUUID(),
      email: parsed.data.email,
      passwordHash,
      createdAt: new Date().toISOString(),
    })
    .onConflictDoNothing({ target: doctors.email })
    .returning({ id: doctors.id });
  if (!doctor) {
    return {
      ok: false as const,
      error:
        "An account with this email already exists. Sign in or use another email.",
    };
  }
  return { ok: true as const, doctorId: doctor.id };
}

export async function verifyDoctor(input: unknown) {
  const parsed = credentialsSchema.safeParse(input);
  if (!parsed.success) return null;
  const [doctor] = await db
    .select()
    .from(doctors)
    .where(eq(doctors.email, parsed.data.email))
    .limit(1);
  const passwordMatches = await bcrypt.compare(
    parsed.data.password,
    doctor?.passwordHash ?? DUMMY_PASSWORD_HASH,
  );
  return doctor && passwordMatches ? { id: doctor.id } : null;
}
