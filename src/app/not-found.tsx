import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-screen max-w-xl content-center gap-4 px-6 text-center">
      <h1 className="font-heading text-2xl font-semibold">Page not found</h1>
      <p className="text-base text-muted-foreground">
        That page is not part of the consultation ledger.
      </p>
      <Link href="/" className="min-h-11 text-primary underline">
        Return to your ledger
      </Link>
    </main>
  );
}
