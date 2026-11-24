export default function Loading() {
  return (
    <main
      className="mx-auto min-h-screen max-w-6xl space-y-8 px-4 py-10"
      role="status"
      aria-busy="true"
      aria-label="Loading consultation ledger"
    >
      <div className="h-12 w-64 animate-pulse rounded-control bg-muted" />
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((row) => (
          <div
            key={row}
            className="h-36 animate-pulse rounded-container bg-muted"
          />
        ))}
      </div>
      <div className="space-y-2">
        {[0, 1, 2, 3, 4].map((row) => (
          <div
            key={row}
            className="h-12 animate-pulse rounded-control bg-muted"
          />
        ))}
      </div>
    </main>
  );
}
