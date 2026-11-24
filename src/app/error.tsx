"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto grid min-h-screen max-w-xl content-center gap-4 px-6 text-center">
      <h1 className="font-heading text-2xl font-semibold">
        We could not load your ledger
      </h1>
      <p className="text-base text-muted-foreground">
        Your records are safe. Try loading the page again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mx-auto min-h-11 rounded-control bg-primary px-4 font-semibold text-primary-foreground"
      >
        Try again
      </button>
    </main>
  );
}
