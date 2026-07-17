import { useMemo } from "react";
import type { Transaction } from "@/lib/types";
import type { CalendarMode } from "./types";

// Filters the current month's transactions down to the selected day, respecting income/expense/balance mode.
export function useSelectedDayTransactions(selectedDate: string | null, monthTx: Transaction[], mode: CalendarMode) {
  return useMemo(() => {
    if (!selectedDate) return [] as Transaction[];
    const sameDay = monthTx.filter(tx => String(tx.date).slice(0, 10) === selectedDate);
    if (mode === 'income') return sameDay.filter(tx => tx.type === 'income');
    if (mode === 'expense') return sameDay.filter(tx => tx.type === 'expense');
    return sameDay; // balance shows both
  }, [selectedDate, monthTx, mode]);
}
