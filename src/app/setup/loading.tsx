export default function SetupLoading() {
  return (
    <main
      className="mx-auto flex min-h-screen w-full max-w-lg items-center px-4 py-10"
      role="status"
      aria-busy="true"
      aria-label="Loading account setup"
    >
      <section className="w-full space-y-6 rounded-container border border-border bg-card p-6 sm:p-8">
        <div className="space-y-3">
          <div className="h-5 w-32 animate-pulse rounded-control bg-muted" />
          <div className="h-9 w-64 animate-pulse rounded-control bg-muted" />
          <div className="h-5 w-full animate-pulse rounded-control bg-muted" />
        </div>
        <div className="space-y-5">
          <div className="h-16 animate-pulse rounded-control bg-muted" />
          <div className="h-16 animate-pulse rounded-control bg-muted" />
          <div className="h-11 w-full animate-pulse rounded-control bg-muted" />
        </div>
      </section>
    </main>
  );
}
