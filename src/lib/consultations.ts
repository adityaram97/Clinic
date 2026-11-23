import { and, count, desc, eq, gte, like, lt, sql } from 'drizzle-orm';
import { db } from '@/db';
import { consultations } from '@/db/schema';

const PAGE_SIZE = 20;

export type PaymentMode = 'cash' | 'digital';
export type Consultation = typeof consultations.$inferSelect;

export type ConsultationFilters = {
  page: number;
  search: string;
  paymentMode: '' | PaymentMode;
};

function filtersWhere(filters: ConsultationFilters) {
  const conditions = [];
  if (filters.search) conditions.push(like(consultations.patientName, `%${filters.search}%`));
  if (filters.paymentMode) {
    conditions.push(eq(consultations.paymentMode, filters.paymentMode));
  }
  return conditions.length ? and(...conditions) : undefined;
}

export async function listConsultations(filters: ConsultationFilters) {
  const where = filtersWhere(filters);
  const [items, [totalRow]] = await Promise.all([
    db
      .select()
      .from(consultations)
      .where(where)
      .orderBy(desc(consultations.consultationDate), desc(consultations.id))
      .limit(PAGE_SIZE)
      .offset((filters.page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(consultations).where(where),
  ]);

  const total = totalRow?.total ?? 0;
  return {
    items,
    total,
    page: filters.page,
    pageSize: PAGE_SIZE,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function periodBounds(now: Date, period: 'day' | 'week' | 'month') {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === 'week') {
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  }
  if (period === 'month') start.setDate(1);

  const end = new Date(start);
  if (period === 'day') end.setDate(end.getDate() + 1);
  if (period === 'week') end.setDate(end.getDate() + 7);
  if (period === 'month') end.setMonth(end.getMonth() + 1);

  return { start: dateKey(start), end: dateKey(end) };
}

async function sumPeriod(start: string, end: string) {
  const [result] = await db
    .select({
      cash: sql<number>`coalesce(sum(case when ${consultations.paymentMode} = 'cash' then ${consultations.amountCents} else 0 end), 0)`,
      digital: sql<number>`coalesce(sum(case when ${consultations.paymentMode} = 'digital' then ${consultations.amountCents} else 0 end), 0)`,
    })
    .from(consultations)
    .where(
      and(gte(consultations.consultationDate, start), lt(consultations.consultationDate, end))
    );

  const cash = result?.cash ?? 0;
  const digital = result?.digital ?? 0;
  return { cash, digital, total: cash + digital };
}

export async function getCurrentRevenueSummaries(now = new Date()) {
  const day = periodBounds(now, 'day');
  const week = periodBounds(now, 'week');
  const month = periodBounds(now, 'month');
  const [daily, weekly, monthly] = await Promise.all([
    sumPeriod(day.start, day.end),
    sumPeriod(week.start, week.end),
    sumPeriod(month.start, month.end),
  ]);
  return { daily, weekly, monthly };
}

export async function updateConsultation(
  id: number,
  values: {
    patientName: string;
    consultationDate: string;
    amountCents: number;
    paymentMode: PaymentMode;
  }
) {
  const [updated] = await db
    .update(consultations)
    .set(values)
    .where(eq(consultations.id, id))
    .returning({ id: consultations.id });
  return Boolean(updated);
}
