import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const consultations = sqliteTable('consultations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  patientName: text('patient_name').notNull(),
  consultationDate: text('consultation_date').notNull(),
  amountCents: integer('amount_cents').notNull(),
  paymentMode: text('payment_mode', { enum: ['cash', 'digital'] }).notNull(),
});
