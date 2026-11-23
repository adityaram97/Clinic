import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-heading text-2xl font-semibold">Record not found</h1>
      <p className="text-muted-foreground">
        That consultation record may have been changed or removed.
      </p>
      <Link
        className="rounded-control bg-primary text-primary-foreground min-h-11 px-5 py-3 font-semibold hover:opacity-90"
        href="/"
      >
        Return to consultations
      </Link>
    </main>
  );
}
