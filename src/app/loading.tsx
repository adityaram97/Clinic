export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading consultation ledger"
      className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:py-12"
      role="status"
    >
      <div className="border-border space-y-3 border-b pb-6">
        <div className="bg-muted h-4 w-40 animate-pulse rounded" />
        <div className="bg-muted h-10 w-80 max-w-full animate-pulse rounded" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            className="rounded-container border-border bg-card h-36 animate-pulse border"
            key={index}
          />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="rounded-control bg-muted h-12 animate-pulse" key={index} />
        ))}
      </div>
    </main>
  );
}
