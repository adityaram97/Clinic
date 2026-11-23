'use client';

import { useState } from 'react';
import type { Consultation } from '@/lib/consultations';
import { ConsultationDialog } from './consultation-dialog';
import { ConsultationTable } from './consultation-table';

type ListResult = {
  items: Consultation[];
  total: number;
  page: number;
  pages: number;
};

export function ConsultationLedger({
  result,
  search,
  mode,
  today,
}: {
  result: ListResult;
  search: string;
  mode: string;
  today: string;
}) {
  const [editing, setEditing] = useState<Consultation | null | undefined>(undefined);
  const [saved, setSaved] = useState(false);

  function startNew() {
    setSaved(false);
    setEditing(null);
  }

  function startEditing(consultation: Consultation) {
    setSaved(false);
    setEditing(consultation);
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-semibold">Consultation records</h2>
          <p className="text-muted-foreground mt-1 text-sm">Patient visits and payments received</p>
        </div>
        <button
          className="rounded-control bg-primary text-primary-foreground focus-visible:outline-ring min-h-11 px-5 text-sm font-semibold shadow-sm transition hover:opacity-90 focus-visible:outline-2 active:scale-[0.98]"
          onClick={startNew}
          type="button"
        >
          Add consultation
        </button>
      </div>
      <ConsultationTable
        items={result.items}
        mode={mode}
        onEdit={startEditing}
        page={result.page}
        pages={result.pages}
        search={search}
        total={result.total}
      />
      {saved && (
        <p className="text-success text-sm font-medium" role="status">
          Consultation saved.
        </p>
      )}
      <ConsultationDialog
        item={editing}
        key={editing?.id ?? (editing === null ? 'new' : 'closed')}
        onClose={() => setEditing(undefined)}
        onSaved={() => {
          setEditing(undefined);
          setSaved(true);
        }}
        today={today}
      />
    </>
  );
}
