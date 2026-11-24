import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentDoctor } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Create doctor account | Clinic ledger",
};

export const dynamic = "force-dynamic";

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const doctorId = await currentDoctor();
  if (doctorId) redirect("/");
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-4 py-10">
      <section className="w-full space-y-6 rounded-container border border-border bg-card p-6 shadow-sm sm:p-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Clinic ledger
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold">
            Create a doctor account
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Each doctor account keeps its consultation records separate from
            others on this installation.
          </p>
        </div>
        <AuthForm
          setup
          initialError={
            error === "invalid"
              ? "Enter a valid email and a password of at least 10 characters."
              : ""
          }
        />
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
