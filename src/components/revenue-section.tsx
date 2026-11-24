"use client";

import { RevenueSummary } from "@/components/revenue-summary";

type Summary = Record<"cash" | "digital" | "total", number>;

export function RevenueSection({
  date,
  loading,
  summaries,
  onDateChange,
}: {
  date: string;
  loading: boolean;
  summaries: Record<string, Summary>;
  onDateChange: (date: string) => void;
}) {
  return (
    <section className="space-y-4" aria-labelledby="summary-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="summary-title" className="font-heading text-2xl font-semibold">
          Revenue summary
        </h2>
        <label className="grid gap-1 text-sm font-medium">
          Summarize through
          <input
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
            className="min-h-11 rounded-control border border-border bg-card px-3"
          />
        </label>
      </div>
      {loading && Object.keys(summaries).length === 0 ? (
        <p role="status" className="rounded-container bg-muted p-5">
          Loading revenue…
        </p>
      ) : (
        <RevenueSummary summaries={summaries} />
      )}
    </section>
  );
}
