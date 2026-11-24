"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { RecordFiltersState } from "@/components/record-filters";
import { today } from "@/lib/format";
import type { RecordRow } from "@/lib/types";

type Summary = Record<"cash" | "digital" | "total", number>;
type ListResult = {
  items: RecordRow[];
  total: number;
  page: number;
  pages: number;
};

export function useDashboardData() {
  const router = useRouter();
  const [records, setRecords] = useState<ListResult>({
    items: [],
    total: 0,
    page: 1,
    pages: 1,
  });
  const [summaries, setSummaries] = useState<Record<string, Summary>>({});
  const [filters, setFilters] = useState<RecordFiltersState>({
    from: "",
    to: "",
    mode: "",
    search: "",
    page: 1,
  });
  const [summaryDate, setSummaryDate] = useState(today);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value) query.set(key, String(value));
    }

    async function loadDashboard() {
      try {
        const [listResponse, summaryResponse] = await Promise.all([
          fetch(`/api/records?${query.toString()}`),
          fetch(`/api/summary?date=${summaryDate}`),
        ]);
        const [listData, summaryData] = await Promise.all([
          listResponse.json(),
          summaryResponse.json(),
        ]);
        if (!active) return;
        if (!listResponse.ok || !summaryResponse.ok) {
          if (listResponse.status === 401 || summaryResponse.status === 401) {
            router.replace("/login");
            return;
          }
          setError(
            listData.error ??
              summaryData.error ??
              "Could not load consultation records.",
          );
          return;
        }
        setRecords(listData);
        setSummaries(summaryData);
        setError("");
      } catch {
        if (active) setError("Could not reach the server. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDashboard();
    return () => {
      active = false;
    };
  }, [filters, refreshVersion, router, summaryDate]);

  function changeFilter(field: keyof RecordFiltersState, value: string) {
    setLoading(true);
    setError("");
    setFilters((current) => ({
      ...current,
      [field]: field === "page" ? Number(value) : value,
      page: field === "page" ? Number(value) : 1,
    }));
  }

  function refreshFirstPage() {
    setLoading(true);
    setError("");
    setFilters((current) => ({ ...current, page: 1 }));
    setRefreshVersion((version) => version + 1);
  }

  function retry() {
    setLoading(true);
    setError("");
    setRefreshVersion((version) => version + 1);
  }

  function changeSummaryDate(date: string) {
    setLoading(true);
    setError("");
    setSummaryDate(date);
  }

  return {
    records,
    summaries,
    filters,
    summaryDate,
    loading,
    error,
    changeFilter,
    changeSummaryDate,
    refreshFirstPage,
    retry,
    setError,
  };
}
