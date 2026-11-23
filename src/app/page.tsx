import { ConsultationFilters } from './consultation-filters';
import { ConsultationLedger } from './consultation-ledger';
import { RevenueSummaries } from './revenue-summaries';
import { getCurrentRevenueSummaries, listConsultations } from '@/lib/consultations';

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const search = firstValue(params.q).trim().slice(0, 100);
  const requestedMode = firstValue(params.mode);
  const mode = requestedMode === 'cash' || requestedMode === 'digital' ? requestedMode : '';
  const requestedPage = Number(firstValue(params.page));
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, 1000) : 1;
  const now = new Date();
  const [initialResult, summaries] = await Promise.all([
    listConsultations({ page, search, paymentMode: mode }),
    getCurrentRevenueSummaries(now),
  ]);
  const result =
    initialResult.page > initialResult.pages
      ? await listConsultations({ page: initialResult.pages, search, paymentMode: mode })
      : initialResult;

  return (
    <>
      <a
        className="focus:rounded-control focus:bg-card focus:ring-ring sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-10 focus:px-4 focus:py-3 focus:ring-2"
        href="#content"
      >
        Skip to content
      </a>
      <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:py-12" id="content">
        <header className="border-border border-b pb-6">
          <p className="text-primary text-sm font-semibold">Consultation ledger</p>
          <h1 className="font-heading mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Patient visits &amp; revenue
          </h1>
          <p className="text-muted-foreground mt-2 max-w-[65ch] text-pretty">
            Keep track of consultations and the payments received.
          </p>
          <p className="rounded-control border-info/30 bg-info/5 text-foreground mt-4 max-w-[65ch] border px-4 py-3 text-sm">
            Private use only: anyone who can access this app can view and edit these records.
          </p>
        </header>
        <RevenueSummaries summaries={summaries} />
        <section aria-label="Consultation records" className="space-y-5">
          <ConsultationFilters mode={mode} search={search} />
          <ConsultationLedger
            mode={mode}
            result={result}
            search={search}
            today={localDateKey(now)}
          />
        </section>
      </main>
    </>
  );
}
