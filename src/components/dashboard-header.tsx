"use client";

import { RecordForm } from "@/components/record-form";

export function DashboardHeader({
  onSaved,
  onSignOut,
}: {
  onSaved: () => void;
  onSignOut: () => void;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Clinic ledger
        </p>
        <h1 className="mt-1 font-heading text-3xl font-semibold text-balance">
          Consultation revenue
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <RecordForm onSaved={onSaved} />
        <button
          type="button"
          onClick={onSignOut}
          className="min-h-11 rounded-control border border-border bg-card px-4 font-medium hover:bg-muted"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
