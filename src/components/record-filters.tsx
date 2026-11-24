"use client";

export type RecordFiltersState = {
  from: string;
  to: string;
  mode: string;
  search: string;
  page: number;
};

export function RecordFilters({
  filters,
  onChange,
}: {
  filters: RecordFiltersState;
  onChange: (field: keyof RecordFiltersState, value: string) => void;
}) {
  const hasFilters = Boolean(
    filters.from || filters.to || filters.mode || filters.search,
  );
  return (
    <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:grid-cols-4">
      <label className="grid gap-1 text-sm font-medium">
        Search patient
        <input
          type="search"
          value={filters.search}
          onChange={(event) => onChange("search", event.target.value)}
          placeholder="Patient name"
          className="min-h-11 rounded-control border border-border bg-card px-3"
        />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        From
        <input
          type="date"
          value={filters.from}
          onChange={(event) => onChange("from", event.target.value)}
          className="min-h-11 rounded-control border border-border bg-card px-3"
        />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        To
        <input
          type="date"
          value={filters.to}
          onChange={(event) => onChange("to", event.target.value)}
          className="min-h-11 rounded-control border border-border bg-card px-3"
        />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Payment mode
        <select
          value={filters.mode}
          onChange={(event) => onChange("mode", event.target.value)}
          className="min-h-11 rounded-control border border-border bg-card px-3"
        >
          <option value="">All modes</option>
          <option value="cash">Cash</option>
          <option value="digital">Digital</option>
        </select>
      </label>
      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            onChange("from", "");
            onChange("to", "");
            onChange("mode", "");
            onChange("search", "");
          }}
          className="min-h-11 justify-self-start text-primary underline underline-offset-4"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
