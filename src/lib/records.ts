import { and, desc, eq, gte, like, lte, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { consultations } from "@/lib/db/schema";
import type { ConsultationInput } from "@/lib/validation";

import { PAGE_SIZE } from "@/lib/constants";

export async function listRecords(options: {
  doctorId: string;
  from?: string;
  to?: string;
  mode?: "cash" | "digital";
  search?: string;
  page: number;
}) {
  const filters = [eq(consultations.doctorId, options.doctorId)];
  if (options.from)
    filters.push(gte(consultations.consultationDate, options.from));
  if (options.to) filters.push(lte(consultations.consultationDate, options.to));
  if (options.mode) filters.push(eq(consultations.paymentMode, options.mode));
  if (options.search)
    filters.push(like(consultations.patientName, `%${options.search}%`));
  const where = and(...filters);
  const [items, count] = await Promise.all([
    db
      .select()
      .from(consultations)
      .where(where)
      .orderBy(
        desc(consultations.consultationDate),
        desc(consultations.createdAt),
      )
      .limit(PAGE_SIZE)
      .offset((options.page - 1) * PAGE_SIZE),
    db
      .select({ total: sql<number>`count(*)` })
      .from(consultations)
      .where(where),
  ]);
  const total = count[0]?.total ?? 0;
  return {
    items,
    total,
    page: options.page,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function saveRecord(
  doctorId: string,
  input: ConsultationInput,
  recordId?: string,
) {
  const now = new Date().toISOString();
  const values = {
    patientName: input.patientName,
    consultationDate: input.consultationDate,
    amountPaise: Math.round(input.amountRupees * 100),
    paymentMode: input.paymentMode,
    updatedAt: now,
  };
  if (recordId) {
    const [updated] = await db
      .update(consultations)
      .set(values)
      .where(
        and(
          eq(consultations.id, recordId),
          eq(consultations.doctorId, doctorId),
        ),
      )
      .returning();
    return updated ?? null;
  }
  const [created] = await db
    .insert(consultations)
    .values({
      id: randomUUID(),
      doctorId,
      ...values,
      createdAt: now,
    })
    .returning();
  return created;
}

export async function getRevenueSummary(doctorId: string, date: string) {
  const selected = new Date(`${date}T00:00:00.000Z`);
  const day = date;
  const weekStart = new Date(selected);
  const weekday = (weekStart.getUTCDay() + 6) % 7;
  weekStart.setUTCDate(weekStart.getUTCDate() - weekday);
  const week = weekStart.toISOString().slice(0, 10);
  const weekEndDate = new Date(weekStart);
  weekEndDate.setUTCDate(weekEndDate.getUTCDate() + 6);
  const month = `${date.slice(0, 7)}-01`;
  const monthEnd = new Date(
    Date.UTC(selected.getUTCFullYear(), selected.getUTCMonth() + 1, 0),
  )
    .toISOString()
    .slice(0, 10);
  const ranges = [
    { key: "day", from: day, to: day },
    { key: "week", from: week, to: weekEndDate.toISOString().slice(0, 10) },
    { key: "month", from: month, to: monthEnd },
  ] as const;
  const summaries = await Promise.all(
    ranges.map(async ({ key, from, to }) => {
      const rows = await db
        .select({
          mode: consultations.paymentMode,
          total: sql<number>`coalesce(sum(${consultations.amountPaise}), 0)`,
        })
        .from(consultations)
        .where(
          and(
            eq(consultations.doctorId, doctorId),
            gte(consultations.consultationDate, from),
            lte(consultations.consultationDate, to),
          ),
        )
        .groupBy(consultations.paymentMode);
      const totals = { cash: 0, digital: 0 };
      for (const row of rows) totals[row.mode] = row.total;
      return [key, { ...totals, total: totals.cash + totals.digital }] as const;
    }),
  );
  return Object.fromEntries(summaries);
}
