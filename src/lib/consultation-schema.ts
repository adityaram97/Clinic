import { z } from 'zod';

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid consultation date.')
  .refine((value) => {
    const timestamp = Date.parse(`${value}T00:00:00.000Z`);
    return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value;
  }, 'Enter a valid consultation date.');

const amountCentsSchema = z
  .string()
  .trim()
  .regex(/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/, 'Enter an amount with up to 2 decimal places.')
  .transform((value) => Math.round(Number(value) * 100))
  .refine(
    (value) => Number.isSafeInteger(value) && value > 0,
    'Enter an amount greater than zero.'
  );

const fields = {
  patientName: z.string().trim().min(1, 'Enter the patient name.').max(120),
  consultationDate: dateSchema,
  amount: amountCentsSchema,
  paymentMode: z.enum(['cash', 'digital']),
};

function withAmountCents<T extends { amount: number }>(values: T) {
  const { amount, ...rest } = values;
  return { ...rest, amountCents: amount };
}

export const createConsultationSchema = z.object(fields).transform(withAmountCents);
export const updateConsultationSchema = z
  .object({
    id: z.number().int().positive(),
    ...fields,
  })
  .transform(withAmountCents);
