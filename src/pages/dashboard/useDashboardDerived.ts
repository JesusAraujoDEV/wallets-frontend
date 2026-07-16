import { useMemo } from "react";
import { convertToUSD, type ExchangeSnapshot } from "@/lib/rates";
import { isBalanceAdjustmentCategory } from "@/lib/utils";
import type { Account, Category, Transaction } from "@/lib/types";

function isCurrentMonth(iso: string, firstOfMonth: Date, now: Date) {
  const d = new Date(iso);
  return d >= firstOfMonth && d <= now;
}

// Category-level USD totals for the current month, shared shape used by both
// the expense pie chart and the budget-vs-actual chart.
function monthlyExpenseTotalsByCategory(
  txByAccount: Transaction[], categories: Category[], accounts: Account[],
  rate: ExchangeSnapshot | null, expenseFilterSet: Set<string>, selectedGroupNumber: number | null,
) {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const expTx = txByAccount
    .filter(t => t.type === "expense" && isCurrentMonth(t.date, firstOfMonth, now))
    .filter(t => {
      const cat = categories.find(c => c.id === t.categoryId);
      if (isBalanceAdjustmentCategory(cat?.name)) return false;
      if (selectedGroupNumber !== null && cat?.groupId !== selectedGroupNumber) return false;
      return true;
    })
    .filter(t => (expenseFilterSet.size > 0 ? expenseFilterSet.has(t.categoryId) : true));

  const totals = new Map<string, number>();
  for (const t of expTx) {
    const acc = accounts.find(a => a.id === t.accountId);
    const usd = convertToUSD(t.amount, (acc?.currency ?? "USD") as any, rate) ?? 0;
    totals.set(t.categoryId, (totals.get(t.categoryId) || 0) + usd);
  }
  return totals;
}

export function useDashboardDerived({ transactions, selectedAccount, categories, accounts, rate, expenseFilterSet, selectedGroupNumber }: {
  transactions: Transaction[]; selectedAccount: string; categories: Category[]; accounts: Account[];
  rate: ExchangeSnapshot | null; expenseFilterSet: Set<string>; selectedGroupNumber: number | null;
}) {
  const txByAccount = useMemo(() => (
    transactions.filter(t => selectedAccount === "all" || t.accountId === selectedAccount)
  ), [transactions, selectedAccount]);

  const monthKey = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, '0')}`;
  }, []);

  const expensePieData = useMemo(() => {
    const totals = monthlyExpenseTotalsByCategory(txByAccount, categories, accounts, rate, expenseFilterSet, selectedGroupNumber);
    return Array.from(totals.entries()).map(([categoryId, amount]) => {
      const cat = categories.find(c => c.id === categoryId);
      return { id: categoryId, category: cat?.name || "Uncategorized", amount, color: cat?.color || "hsl(var(--chart-6))" };
    });
  }, [txByAccount, categories, accounts, rate, expenseFilterSet, selectedGroupNumber]);

  const budgetData = useMemo(() => {
    const totals = monthlyExpenseTotalsByCategory(txByAccount, categories, accounts, rate, expenseFilterSet, selectedGroupNumber);
    return Array.from(totals.entries()).map(([categoryId, actual]) => {
      const cat = categories.find(c => c.id === categoryId);
      return { category: cat?.name || "Uncategorized", budget: 0, actual };
    });
  }, [txByAccount, categories, accounts, rate, expenseFilterSet, selectedGroupNumber]);

  return { txByAccount, monthKey, expensePieData, budgetData };
}
