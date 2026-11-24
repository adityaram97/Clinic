import { formatPaise } from "@/lib/format";

type Summary = Record<"cash" | "digital" | "total", number>;

export function RevenueSummary({
  summaries,
}: {
  summaries: Record<string, Summary>;
}) {
  const periods = [
    ["day", "Today"],
    ["week", "This week"],
    ["month", "This month"],
  ] as const;
  return (
    <section
      aria-label="Consulting revenue"
      className="grid gap-4 md:grid-cols-3"
    >
      {periods.map(([key, label]) => {
        const totals = summaries[key] ?? { cash: 0, digital: 0, total: 0 };
        return (
          <article
            key={key}
            className="rounded-container border border-border bg-card p-5 shadow-sm"
          >
            <p className="text-base font-medium text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 font-heading text-3xl font-semibold tabular-nums text-card-foreground">
              {formatPaise(totals.total)}
            </p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-3 text-base">
              <span>
                Cash{" "}
                <strong className="tabular-nums">
                  {formatPaise(totals.cash)}
                </strong>
              </span>
              <span>
                Digital{" "}
                <strong className="tabular-nums">
                  {formatPaise(totals.digital)}
                </strong>
              </span>
            </div>
          </article>
        );
      })}
    </section>
  );
}
