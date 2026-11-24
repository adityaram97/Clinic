import { RecordForm } from "@/components/record-form";
import { formatPaise } from "@/lib/format";
import type { RecordRow } from "@/lib/types";

export function RecordTable({
  records,
  onSaved,
  isFiltered,
}: {
  records: RecordRow[];
  onSaved: () => void;
  isFiltered: boolean;
}) {
  if (records.length === 0) {
    return (
      <p className="rounded-container border border-dashed border-border p-8 text-center text-muted-foreground">
        {isFiltered
          ? "No consultations match these filters. Adjust or clear the filters."
          : "No consultations yet. Add a consultation to start tracking payments."}
      </p>
    );
  }
  return (
    <div
      className="overflow-x-auto rounded-container border border-border bg-card shadow-sm"
      tabIndex={0}
      aria-label="Consultations table, scrollable"
    >
      <table className="w-full min-w-[38rem] text-left">
        <caption className="sr-only">Consultation records and payments</caption>
        <thead className="bg-muted/60 text-sm text-muted-foreground">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              Patient
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Date
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Mode
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Amount
            </th>
            <th scope="col" className="px-4 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr
              key={record.id}
              className="border-t border-border transition-colors hover:bg-muted/40"
            >
              <th scope="row" className="px-4 py-3 font-medium">
                {record.patientName}
              </th>
              <td className="px-4 py-3 tabular-nums">
                {new Intl.DateTimeFormat("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  timeZone: "UTC",
                }).format(new Date(`${record.consultationDate}T00:00:00Z`))}
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex rounded-full bg-muted px-3 py-1 text-sm font-medium capitalize">
                  {record.paymentMode}
                </span>
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {formatPaise(record.amountPaise)}
              </td>
              <td className="px-2 py-2 text-right">
                <RecordForm record={record} onSaved={onSaved} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
