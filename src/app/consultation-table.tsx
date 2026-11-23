'use client';

import type { Consultation } from '@/lib/consultations';
import { formatAmount, formatDate } from '@/lib/formatters';

export function ConsultationTable({
  items,
  total,
  page,
  pages,
  search,
  mode,
  onEdit,
}: {
  items: Consultation[];
  total: number;
  page: number;
  pages: number;
  search: string;
  mode: string;
  onEdit: (consultation: Consultation) => void;
}) {
  if (!total) {
    return (
      <div className="rounded-container border-border bg-card border border-dashed px-6 py-12 text-center">
        <h2 className="text-lg font-semibold">
          {search || mode ? 'No matching consultations' : 'No consultations yet'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {search || mode
            ? 'Try changing your search or payment mode.'
            : 'Add a consultation to start tracking your revenue.'}
        </p>
      </div>
    );
  }

  const query = new URLSearchParams();
  if (search) query.set('q', search);
  if (mode) query.set('mode', mode);
  const pageHref = (targetPage: number) => {
    const params = new URLSearchParams(query);
    params.set('page', String(targetPage));
    return `/?${params.toString()}`;
  };

  return (
    <>
      <div
        aria-label="Consultation records, horizontally scrollable"
        className="rounded-container border-border bg-card overflow-x-auto border"
        tabIndex={0}
      >
        <table className="w-full min-w-[42rem] text-left text-sm">
          <caption className="sr-only">Consultation records</caption>
          <thead className="bg-muted/70 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium" scope="col">
                Patient
              </th>
              <th className="px-4 py-3 font-medium" scope="col">
                Date
              </th>
              <th className="px-4 py-3 text-right font-medium" scope="col">
                Amount
              </th>
              <th className="px-4 py-3 font-medium" scope="col">
                Payment mode
              </th>
              <th className="px-4 py-3 text-right font-medium" scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr className="border-border border-t" key={item.id}>
                <th className="px-4 py-3.5 font-medium" scope="row">
                  {item.patientName}
                </th>
                <td className="text-muted-foreground px-4 py-3.5">
                  {formatDate(item.consultationDate)}
                </td>
                <td className="px-4 py-3.5 text-right tabular-nums">
                  {formatAmount(item.amountCents)}
                </td>
                <td className="px-4 py-3.5">
                  <span className="bg-muted inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize">
                    {item.paymentMode}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <button
                    aria-label={`Edit ${item.patientName}`}
                    className="rounded-control text-primary hover:bg-muted focus-visible:outline-ring min-h-11 px-3 text-sm font-semibold transition focus-visible:outline-2 active:scale-[0.98]"
                    onClick={() => onEdit(item)}
                    type="button"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <nav
        aria-label="Pagination"
        className="text-muted-foreground flex items-center justify-between gap-4 text-sm"
      >
        <span>
          Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
        </span>
        <div className="flex items-center gap-3">
          {page > 1 && (
            <a
              className="text-primary min-h-11 px-3 py-3 hover:underline"
              href={pageHref(page - 1)}
            >
              Previous
            </a>
          )}
          <span aria-current="page" className="text-foreground font-semibold">
            {page}
          </span>
          {page < pages && (
            <a
              className="text-primary min-h-11 px-3 py-3 hover:underline"
              href={pageHref(page + 1)}
            >
              Next
            </a>
          )}
        </div>
      </nav>
    </>
  );
}
