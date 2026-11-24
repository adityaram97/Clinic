import type { RecordRow } from "@/lib/types";

export function RecordFields({ record }: { record?: RecordRow }) {
  return (
    <>
      <label className="grid gap-2 text-base font-medium">
        Patient name
        <input
          name="patientName"
          required
          maxLength={120}
          defaultValue={record?.patientName}
          className="min-h-11 rounded-control border border-border bg-card px-3"
        />
      </label>
      <label className="grid gap-2 text-base font-medium">
        Consultation date
        <input
          name="consultationDate"
          type="date"
          required
          defaultValue={record?.consultationDate}
          className="min-h-11 rounded-control border border-border bg-card px-3"
        />
      </label>
      <label className="grid gap-2 text-base font-medium">
        Amount (INR)
        <input
          name="amountRupees"
          type="number"
          min="0.01"
          max="10000000"
          step="0.01"
          required
          defaultValue={record ? (record.amountPaise / 100).toFixed(2) : ""}
          className="min-h-11 rounded-control border border-border bg-card px-3"
        />
      </label>
      <fieldset className="grid gap-2">
        <legend className="text-base font-medium">Payment mode</legend>
        <div className="flex gap-5">
          {(["cash", "digital"] as const).map((mode) => (
            <label
              key={mode}
              className="flex min-h-11 items-center gap-2 capitalize"
            >
              <input
                type="radio"
                name="paymentMode"
                value={mode}
                required
                defaultChecked={
                  record?.paymentMode === mode || (!record && mode === "cash")
                }
              />
              {mode}
            </label>
          ))}
        </div>
      </fieldset>
    </>
  );
}
