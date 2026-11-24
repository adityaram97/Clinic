import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentDoctor } from "@/lib/auth";
import { hasDoctorAccount } from "@/lib/account";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Sign in | Clinic ledger",
};

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const [doctorId, accountExists] = await Promise.all([
    currentDoctor(),
    hasDoctorAccount(),
  ]);
  if (!accountExists) redirect("/setup");
  if (doctorId) redirect("/");
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-4 py-10">
      <section className="w-full space-y-6 rounded-container border border-border bg-card p-6 shadow-sm sm:p-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Clinic ledger
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold">Sign in</h1>
          <p className="mt-2 text-base text-muted-foreground">
            Sign in to view your private consultation records.
          </p>
        </div>
        <AuthForm
          initialError={
            error === "invalid"
              ? "Invalid email or password."
              : error === "account_exists"
                ? "This doctor account already exists. Sign in."
                : ""
          }
        />
        <p className="text-sm text-muted-foreground">
          This app is for one doctor account on this installation.
        </p>
        <Link href="/" className="sr-only">
          Back to consultation ledger
        </Link>
      </section>
    </main>
  );
}
