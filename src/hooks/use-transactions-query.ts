import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/http";
import type { Transaction } from "@/lib/types";
import { buildTransactionsQuery, mapServerTransaction, PAGE_SIZE_DEFAULT } from "@/lib/transactions";

export type UseTransactionsQueryArgs = {
  filters: {
    searchQuery: string;
    filterType: "all" | "income" | "expense";
    filterIncomeCategories: string[];
    filterExpenseCategories: string[];
    filterAccounts: string[];
    dateMode: "none" | "day" | "range" | "month";
    filterDate: string;
    filterDateFrom: string;
    filterDateTo: string;
    filterMonth: string;
  };
  pageSize?: number;
};

export function useTransactionsQuery({ filters, pageSize = PAGE_SIZE_DEFAULT }: UseTransactionsQueryArgs) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [nextCursorDate, setNextCursorDate] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const reqIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const [firstReloadTick, setFirstReloadTick] = useState(0);

  const buildPath = (cursor?: string | null) => buildTransactionsQuery({
    ...filters,
  }, pageSize, cursor).path;

  const fetchLegacyAll = async (signal?: AbortSignal) => {
    const arr = await apiFetch<any[]>(`transactions`, { signal });
    setTransactions((arr || []).map(mapServerTransaction));
    setNextCursorDate(null);
    setHasMore(false);
    setFirstReloadTick((v) => v + 1);
  };

  const fetchFirstPage = async () => {
    try {
      setPageLoading(true);
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const myReqId = ++reqIdRef.current;
      const path = buildPath();
      const data: any = await apiFetch<any>(path, { signal: controller.signal });
      if (myReqId !== reqIdRef.current) return;
      if (Array.isArray(data)) {
        setTransactions((data as any[]).map(mapServerTransaction));
        setNextCursorDate(null);
        setHasMore(false);
      } else {
        setTransactions(((data?.items as any[]) || []).map(mapServerTransaction));
        setNextCursorDate((data?.nextCursorDate as string) || null);
        setHasMore(!!data?.hasMore);
      }
      setFirstReloadTick((v) => v + 1);
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
      try {
        await fetchLegacyAll(abortRef.current?.signal);
      } catch (e2) {
        throw e2;
      }
    } finally {
      setPageLoading(false);
    }
  };

  const fetchNextPage = async () => {
    if (!hasMore || !nextCursorDate) return;
    try {
      setPageLoading(true);
      const path = buildPath(nextCursorDate);
      const data: any = await apiFetch<any>(path);
      if (Array.isArray(data)) {
        setTransactions(prev => [...prev, ...(data as any[]).map(mapServerTransaction)]);
        setNextCursorDate(null);
        setHasMore(false);
      } else {
        setTransactions(prev => [...prev, ...(((data?.items as any[]) || []).map(mapServerTransaction))]);
        setNextCursorDate((data?.nextCursorDate as string) || null);
        setHasMore(!!data?.hasMore);
      }
    } finally {
      setPageLoading(false);
    }
  };

  // Initial and when filters change
  useEffect(() => {
    setTransactions([]);
    setNextCursorDate(null);
    setHasMore(false);
    fetchFirstPage().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.searchQuery,
    filters.filterType,
    filters.filterIncomeCategories.join(','),
    filters.filterExpenseCategories.join(','),
    filters.filterAccounts.join(','),
    filters.dateMode,
    filters.filterDate,
    filters.filterDateFrom,
    filters.filterDateTo,
    filters.filterMonth,
  ]);

  return {
    transactions,
    pageLoading,
    hasMore,
    fetchNextPage,
    refetch: fetchFirstPage,
    firstReloadTick,
  } as const;
}
