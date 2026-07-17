import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchPendingTransactions,
  fetchRecurringTransactions,
  PENDING_TRANSACTIONS_QUERY_KEY,
  RECURRING_TRANSACTIONS_QUERY_KEY,
} from "@/lib/subscriptions";
import { DEBTS_QUERY_KEY, fetchDebts } from "@/lib/debts";
import type { Category } from "@/lib/types";
import { buildEvents, type CalendarEvent } from "./types";

export function useCalendarData(categories: Category[]) {
  const subsQuery = useQuery({
    queryKey: RECURRING_TRANSACTIONS_QUERY_KEY,
    queryFn: fetchRecurringTransactions,
    staleTime: 30_000,
  });

  const debtsQuery = useQuery({
    queryKey: DEBTS_QUERY_KEY,
    queryFn: fetchDebts,
    staleTime: 30_000,
  });

  const pendingQuery = useQuery({
    queryKey: PENDING_TRANSACTIONS_QUERY_KEY,
    queryFn: fetchPendingTransactions,
    staleTime: 30_000,
  });

  const events = useMemo(
    () => buildEvents(subsQuery.data ?? [], debtsQuery.data ?? [], pendingQuery.data ?? [], categories),
    [subsQuery.data, debtsQuery.data, pendingQuery.data, categories],
  );

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of events) {
      const key = ev.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return map;
  }, [events]);

  return {
    subsQuery,
    debtsQuery,
    pendingQuery,
    isLoading: subsQuery.isLoading || debtsQuery.isLoading || pendingQuery.isLoading,
    eventsByDate,
    pendingTransactions: pendingQuery.data ?? [],
  };
}
