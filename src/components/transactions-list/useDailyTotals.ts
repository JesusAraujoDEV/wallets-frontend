import { useEffect, useState } from "react";
import { isBalanceAdjustmentCategory } from "@/lib/utils";
import type { Transaction, Category } from "@/lib/types";

export type DailyTotal = { income: number; expenses: number; balance: number };

// Per-day income/expense/balance in USD. Prefers the server-computed
// amountUsd; falls back to the already-fetched per-date VES rate (no network
// call per transaction — that was the second half of the list's N+1).
export function useDailyTotals(
  groupedTransactions: Record<string, Transaction[]>,
  categories: Category[],
  vesRateByDate: Record<string, number | null>,
  resetKey: unknown,
) {
  const [groupTotals, setGroupTotals] = useState<Record<string, DailyTotal>>({});

  useEffect(() => {
    setGroupTotals({});
  }, [resetKey]);

  useEffect(() => {
    const updates: Record<string, DailyTotal> = {};
    for (const [d, txs] of Object.entries(groupedTransactions)) {
      if (groupTotals[d] !== undefined) continue;
      const rate = vesRateByDate[d];
      if (rate === undefined) continue; // rate not loaded yet for this date

      const relevant = txs.filter((tx) => {
        const cat = categories.find((c) => c.id === tx.categoryId);
        return !isBalanceAdjustmentCategory(cat?.name);
      });
      let income = 0;
      let expenses = 0;
      for (const tx of relevant) {
        const usd = tx.amountUsd != null
          ? tx.amountUsd
          : (rate != null && isFinite(rate) && rate > 0 ? tx.amount / rate : 0);
        if (tx.type === 'income') income += usd; else expenses += usd;
      }
      updates[d] = { income, expenses, balance: income - expenses };
    }
    if (Object.keys(updates).length > 0) {
      setGroupTotals((prev) => ({ ...prev, ...updates }));
    }
  }, [groupedTransactions, categories, vesRateByDate, groupTotals]);

  return groupTotals;
}
