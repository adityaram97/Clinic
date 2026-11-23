'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import type { FormEvent } from 'react';
import { createConsultation, editConsultation } from '@/app/actions';
import type { Consultation } from '@/lib/consultations';
import { ConsultationFields, type FormValues } from './consultation-fields';

function initialValues(item: Consultation | null, today: string): FormValues {
  return {
    patientName: item?.patientName ?? '',
    consultationDate: item?.consultationDate ?? today,
    amount: item ? (item.amountCents / 100).toFixed(2) : '',
    paymentMode: item?.paymentMode ?? 'cash',
  };
}

export function ConsultationDialog({
  item,
  today,
  onClose,
  onSaved,
}: {
  item: Consultation | null | undefined;
  today: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [values, setValues] = useState(() => initialValues(item ?? null, today));
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const open = item !== undefined;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function updateValue<Key extends keyof FormValues>(key: Key, value: FormValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
    setError('');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = item
        ? await editConsultation({ ...values, id: item.id })
        : await createConsultation(values);
      if (!result.success) {
        setError(result.error);
        return;
      }
      onSaved();
    });
  }

  return (
    <dialog
      aria-labelledby="consultation-dialog-title"
      className="rounded-container border-border bg-card text-card-foreground backdrop:bg-foreground/40 w-[min(34rem,calc(100%-2rem))] border p-0 shadow-xl"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      ref={dialogRef}
    >
      <form className="space-y-5 p-6 sm:p-8" onSubmit={handleSubmit}>
        <header className="space-y-1">
          <h2 className="font-heading text-2xl font-semibold" id="consultation-dialog-title">
            {item ? 'Edit consultation' : 'Add consultation'}
          </h2>
          <p className="text-muted-foreground text-sm">Record the visit and payment received.</p>
        </header>
        {error && (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        )}
        <ConsultationFields onChange={updateValue} values={values} />
        <footer className="flex justify-end gap-3 pt-2">
          <button
            className="rounded-control border-border hover:bg-muted focus-visible:outline-ring min-h-11 border px-4 text-sm font-semibold transition focus-visible:outline-2"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-control bg-primary text-primary-foreground focus-visible:outline-ring min-h-11 px-5 text-sm font-semibold transition hover:opacity-90 focus-visible:outline-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={pending}
            type="submit"
          >
            {pending ? 'Saving…' : item ? 'Save changes' : 'Add consultation'}
          </button>
        </footer>
      </form>
    </dialog>
  );
}
