import { useEffect, useState } from "react";
import { isBalanceAdjustmentCategory } from "@/lib/utils";
import { convertToUSDByDate } from "@/lib/rates";
import type { Category, Transaction } from "@/lib/types";

// Computes per-day income/expense totals (in USD) and transaction counts, excluding balance adjustments.
export function useDailyTotals(monthTx: Transaction[], categories: Category[]) {
  const [dailyIncome, setDailyIncome] = useState<Record<string, number>>({});
  const [dailyExpense, setDailyExpense] = useState<Record<string, number>>({});
  const [dailyCountIncome, setDailyCountIncome] = useState<Record<string, number>>({});
  const [dailyCountExpense, setDailyCountExpense] = useState<Record<string, number>>({});

  useEffect(() => {
    let alive = true;
    (async () => {
      const incomeMap: Record<string, number> = {};
      const expenseMap: Record<string, number> = {};
      const countIncome: Record<string, number> = {};
      const countExpense: Record<string, number> = {};
      for (const tx of monthTx) {
        const cat = categories.find(c => c.id === tx.categoryId);
        if (isBalanceAdjustmentCategory(cat?.name)) continue; // still exclude adjustments
        let usd = tx.amountUsd != null
          ? Number(tx.amountUsd)
          : Number(await convertToUSDByDate(tx.amount, (tx as any).currency, tx.date));
        if (!isFinite(usd)) usd = 0;
        const key = String(tx.date).slice(0, 10);
        if (tx.type === 'income') incomeMap[key] = (incomeMap[key] || 0) + usd;
        else if (tx.type === 'expense') expenseMap[key] = (expenseMap[key] || 0) + usd;
        if (tx.type === 'income') countIncome[key] = (countIncome[key] || 0) + 1;
        if (tx.type === 'expense') countExpense[key] = (countExpense[key] || 0) + 1;
      }
      if (alive) { setDailyIncome(incomeMap); setDailyExpense(expenseMap); setDailyCountIncome(countIncome); setDailyCountExpense(countExpense); }
    })();
    return () => { alive = false; };
  }, [monthTx, categories]);

  return { dailyIncome, dailyExpense, dailyCountIncome, dailyCountExpense };
}
