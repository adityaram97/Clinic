'use client';

export type FormValues = {
  patientName: string;
  consultationDate: string;
  amount: string;
  paymentMode: 'cash' | 'digital';
};

export function ConsultationFields({
  values,
  onChange,
}: {
  values: FormValues;
  onChange: <Key extends keyof FormValues>(key: Key, value: FormValues[Key]) => void;
}) {
  return (
    <>
      <label className="grid gap-1.5 text-sm font-medium">
        Patient name <span className="text-destructive">(required)</span>
        <input
          autoComplete="name"
          className="rounded-control border-border bg-background focus-visible:ring-ring min-h-11 border px-3 font-normal outline-none focus-visible:ring-2"
          maxLength={120}
          onChange={(event) => onChange('patientName', event.target.value)}
          required
          value={values.patientName}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">
          Consultation date <span className="text-destructive">(required)</span>
          <input
            className="rounded-control border-border bg-background focus-visible:ring-ring min-h-11 border px-3 font-normal outline-none focus-visible:ring-2"
            onChange={(event) => onChange('consultationDate', event.target.value)}
            required
            type="date"
            value={values.consultationDate}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Amount (INR) <span className="text-destructive">(required)</span>
          <input
            className="rounded-control border-border bg-background focus-visible:ring-ring min-h-11 border px-3 font-normal outline-none focus-visible:ring-2"
            inputMode="decimal"
            min="0.01"
            onChange={(event) => onChange('amount', event.target.value)}
            placeholder="0.00"
            required
            step="0.01"
            type="number"
            value={values.amount}
          />
        </label>
      </div>
      <label className="grid gap-1.5 text-sm font-medium">
        Payment mode <span className="text-destructive">(required)</span>
        <select
          className="rounded-control border-border bg-background focus-visible:ring-ring min-h-11 border px-3 font-normal outline-none focus-visible:ring-2"
          onChange={(event) =>
            onChange('paymentMode', event.target.value as FormValues['paymentMode'])
          }
          value={values.paymentMode}
        >
          <option value="cash">Cash</option>
          <option value="digital">Digital</option>
        </select>
      </label>
    </>
  );
}
