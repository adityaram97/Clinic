"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AuthForm({
  setup = false,
  initialError = "",
}: {
  setup?: boolean;
  initialError?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState(initialError);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch(`/api/auth/${setup ? "setup" : "login"}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Could not sign in. Try again.");
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError(
        "Could not reach the server. Check your connection and try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      method="post"
      action={`/api/auth/${setup ? "setup" : "login"}`}
      className="space-y-5"
    >
      <label className="grid gap-2 text-base font-medium">
        Email address
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          className="min-h-11 rounded-control border border-border bg-card px-3 text-card-foreground"
        />
      </label>
      <label className="grid gap-2 text-base font-medium">
        Password
        <input
          name="password"
          type="password"
          autoComplete={setup ? "new-password" : "current-password"}
          required
          minLength={10}
          maxLength={72}
          className="min-h-11 rounded-control border border-border bg-card px-3 text-card-foreground"
        />
        {setup && (
          <span className="text-sm font-normal text-muted-foreground">
            Use at least 10 characters.
          </span>
        )}
      </label>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 w-full rounded-control bg-primary px-4 font-semibold text-primary-foreground transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Please wait…" : setup ? "Create doctor account" : "Sign in"}
      </button>
    </form>
  );
}
