"use client";

import { PAGE_SIZE } from "@/lib/constants";
import {
  RecordFilters,
  type RecordFiltersState,
} from "@/components/record-filters";
import { RecordTable } from "@/components/record-table";
import type { RecordRow } from "@/lib/types";

const skeletonKeys = [
  "consultation-row-skeleton-1",
  "consultation-row-skeleton-2",
  "consultation-row-skeleton-3",
  "consultation-row-skeleton-4",
  "consultation-row-skeleton-5",
];

export function RecordsSection({
  records,
  filters,
  error,
  loading,
  onFilterChange,
  onRetry,
  onSaved,
}: {
  records: { items: RecordRow[]; total: number; page: number; pages: number };
  filters: RecordFiltersState;
  error: string;
  loading: boolean;
  onFilterChange: (field: keyof RecordFiltersState, value: string) => void;
  onRetry: () => void;
  onSaved: () => void;
}) {
  const isFiltered = Boolean(
    filters.from || filters.to || filters.mode || filters.search,
  );
  return (
    <section className="space-y-4" aria-labelledby="records-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="records-title"
            className="font-heading text-2xl font-semibold"
          >
            Consultation records
          </h2>
          <p className="mt-1 text-base text-muted-foreground">
            {records.total} {records.total === 1 ? "record" : "records"}
          </p>
        </div>
        <RecordFilters filters={filters} onChange={onFilterChange} />
      </div>
      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-destructive p-3 text-destructive"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={onRetry}
            className="min-h-11 underline"
          >
            Retry
          </button>
        </div>
      )}
      {loading && records.items.length === 0 ? (
        <div
          role="status"
          aria-label="Loading consultation records"
          className="space-y-2"
        >
          {skeletonKeys.map((skeletonKey) => (
            <div
              key={skeletonKey}
              className="h-12 animate-pulse rounded-control bg-muted"
            />
          ))}
        </div>
      ) : (
        <RecordTable
          records={records.items}
          onSaved={onSaved}
          isFiltered={isFiltered}
        />
      )}
      {records.total > 0 && (
        <nav
          aria-label="Pagination"
          className="flex items-center justify-between gap-3 text-base"
        >
          <span>
            Showing {(records.page - 1) * PAGE_SIZE + 1} to{" "}
            {Math.min(records.page * PAGE_SIZE, records.total)} of{" "}
            {records.total}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={records.page <= 1 || loading}
              onClick={() => onFilterChange("page", String(records.page - 1))}
              className="min-h-11 rounded-control border border-border px-3 disabled:opacity-50"
            >
              Previous
            </button>
            <span
              aria-current="page"
              className="flex min-h-11 items-center px-2"
            >
              {records.page} / {records.pages}
            </span>
            <button
              type="button"
              disabled={records.page >= records.pages || loading}
              onClick={() => onFilterChange("page", String(records.page + 1))}
              className="min-h-11 rounded-control border border-border px-3 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </nav>
      )}
    </section>
  );
}
