import type { getCurrentRevenueSummaries } from '@/lib/consultations';
import { formatAmount } from '@/lib/formatters';

type Summaries = Awaited<ReturnType<typeof getCurrentRevenueSummaries>>;

const periods = [
  { key: 'daily', label: 'Today' },
  { key: 'weekly', label: 'This week' },
  { key: 'monthly', label: 'This month' },
] as const;

export function RevenueSummaries({ summaries }: { summaries: Summaries }) {
  return (
    <section aria-labelledby="revenue-heading" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-heading text-xl font-semibold" id="revenue-heading">
            Consulting revenue
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Amounts are shown in Indian rupees (INR).
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {periods.map(({ key, label }) => {
          const values = summaries[key];
          return (
            <article
              className="rounded-container border-border bg-card border p-5 shadow-sm"
              key={key}
            >
              <h3 className="text-muted-foreground text-sm font-semibold">{label}</h3>
              <p className="font-heading text-foreground mt-2 text-3xl font-semibold tabular-nums">
                {formatAmount(values.total)}
              </p>
              <dl className="border-border mt-4 grid grid-cols-2 gap-3 border-t pt-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Cash</dt>
                  <dd className="mt-1 font-semibold tabular-nums">{formatAmount(values.cash)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Digital</dt>
                  <dd className="mt-1 font-semibold tabular-nums">
                    {formatAmount(values.digital)}
                  </dd>
                </div>
              </dl>
            </article>
          );
        })}
      </div>
    </section>
  );
}
