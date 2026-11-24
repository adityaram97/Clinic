import { integer, index, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const doctors = sqliteTable("doctors", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: text("created_at").notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  doctorId: text("doctor_id")
    .notNull()
    .references(() => doctors.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
});

export const consultations = sqliteTable(
  "consultations",
  {
    id: text("id").primaryKey(),
    doctorId: text("doctor_id")
      .notNull()
      .references(() => doctors.id, { onDelete: "cascade" }),
    patientName: text("patient_name").notNull(),
    consultationDate: text("consultation_date").notNull(),
    amountPaise: integer("amount_paise").notNull(),
    paymentMode: text("payment_mode", { enum: ["cash", "digital"] }).notNull(),
    clinicName: text("clinic_name"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("consultations_doctor_date_idx").on(
      table.doctorId,
      table.consultationDate,
    ),
  ],
);
