'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { consultations } from '@/db/schema';
import { createConsultationSchema, updateConsultationSchema } from '@/lib/consultation-schema';
import { updateConsultation } from '@/lib/consultations';

export type MutationResult = { success: true } | { success: false; error: string };

export async function createConsultation(input: unknown): Promise<MutationResult> {
  const parsed = createConsultationSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Check the form fields.' };

  try {
    await db.insert(consultations).values(parsed.data);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to create consultation', error);
    return { success: false, error: 'Could not save the consultation. Try again.' };
  }
}

export async function editConsultation(input: unknown): Promise<MutationResult> {
  const parsed = updateConsultationSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Check the form fields.' };

  const { id, ...values } = parsed.data;
  try {
    const updated = await updateConsultation(id, values);
    if (!updated) return { success: false, error: 'This consultation could not be found.' };

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to update consultation', error);
    return { success: false, error: 'Could not save the consultation. Try again.' };
  }
}
