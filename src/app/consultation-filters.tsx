'use client';

import Link from 'next/link';

export function ConsultationFilters({ search, mode }: { search: string; mode: string }) {
  return (
    <form className="flex flex-wrap items-end gap-3" role="search">
      <label className="grid min-w-56 flex-1 gap-1.5 text-sm font-medium">
        Patient name
        <input
          className="rounded-control border-border bg-card text-foreground focus-visible:ring-ring min-h-11 border px-3 font-normal transition outline-none focus-visible:ring-2"
          name="q"
          defaultValue={search}
          placeholder="Search consultations"
          type="search"
        />
      </label>
      <label className="grid min-w-40 gap-1.5 text-sm font-medium">
        Payment mode
        <select
          className="rounded-control border-border bg-card text-foreground focus-visible:ring-ring min-h-11 border px-3 font-normal transition outline-none focus-visible:ring-2"
          name="mode"
          defaultValue={mode}
        >
          <option value="">All modes</option>
          <option value="cash">Cash</option>
          <option value="digital">Digital</option>
        </select>
      </label>
      <button
        className="rounded-control border-border bg-card hover:bg-muted focus-visible:outline-ring min-h-11 border px-4 text-sm font-semibold transition focus-visible:outline-2 active:scale-[0.98]"
        type="submit"
      >
        Apply filters
      </button>
      {(search || mode) && (
        <Link
          className="text-primary px-2 py-3 text-sm font-medium underline-offset-4 hover:underline"
          href="/"
        >
          Clear
        </Link>
      )}
    </form>
  );
}
