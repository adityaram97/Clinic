import { z } from "zod";

import { paymentModes } from "@/lib/constants";

export const isoDateSchema = z.iso.date("Choose a valid date.");

export const consultationSchema = z.object({
  patientName: z.string().trim().min(1, "Enter the patient's name.").max(120),
  consultationDate: isoDateSchema,
  amountRupees: z
    .number()
    .finite()
    .positive()
    .max(10000000)
    .refine(
      (amount) => Math.abs(amount * 100 - Math.round(amount * 100)) < 1e-8,
      "Enter no more than two decimal places.",
    ),
  paymentMode: z.enum(paymentModes),
});

export const credentialsSchema = z.object({
  email: z.email().trim().toLowerCase().max(254),
  password: z
    .string()
    .min(10)
    .max(72)
    .refine(
      (password) => new TextEncoder().encode(password).length <= 72,
      "Password is too long.",
    ),
});

export type ConsultationInput = z.infer<typeof consultationSchema>;
