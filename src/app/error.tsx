'use client';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-heading text-2xl font-semibold">We couldn’t load the ledger</h1>
      <p className="text-muted-foreground">Your consultation records are still saved. Try again.</p>
      <button
        className="rounded-control bg-primary text-primary-foreground focus-visible:outline-ring min-h-11 px-5 font-semibold transition hover:opacity-90 focus-visible:outline-2 active:scale-[0.98]"
        onClick={reset}
        type="button"
      >
        Try again
      </button>
    </main>
  );
}
