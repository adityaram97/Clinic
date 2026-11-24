"use client";

import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { RecordsSection } from "@/components/records-section";
import { RevenueSection } from "@/components/revenue-section";
import { useDashboardData } from "@/components/use-dashboard-data";

export function Dashboard() {
  const router = useRouter();
  const data = useDashboardData();

  async function signOut() {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        data.setError("Could not sign out. Please try again.");
        return;
      }
      router.replace("/login");
      router.refresh();
    } catch {
      data.setError("Could not reach the server. Please try again.");
    }
  }

  return (
    <>
      <a
        href="#dashboard-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-card focus:p-3 focus:text-card-foreground"
      >
        Skip to content
      </a>
      <main
        id="dashboard-content"
        className="mx-auto min-h-screen w-full max-w-6xl space-y-8 px-4 py-6 sm:px-6 sm:py-10"
      >
        <DashboardHeader
          onSaved={data.refreshFirstPage}
          onSignOut={() => void signOut()}
        />
        <RevenueSection
          date={data.summaryDate}
          loading={data.loading}
          summaries={data.summaries}
          onDateChange={data.changeSummaryDate}
        />
        <RecordsSection
          records={data.records}
          filters={data.filters}
          error={data.error}
          loading={data.loading}
          onFilterChange={data.changeFilter}
          onRetry={data.retry}
          onSaved={data.refreshFirstPage}
        />
      </main>
    </>
  );
}
