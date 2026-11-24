import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { doctors } from "@/lib/db/schema";

export async function hasDoctorAccount() {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(doctors);
  return (result?.count ?? 0) > 0;
}
