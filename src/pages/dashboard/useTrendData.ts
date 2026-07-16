import { useEffect, useState } from "react";
import { fetchIncomeMonthly, fetchExpenseMonthly } from "@/lib/summary";
import type { Category } from "@/lib/types";

export function useTrendData({ selectedAccount, selectedGroupNumber, selectedIncomeCats, selectedExpenseCats, visibleIncomeCategories, visibleExpenseCategories }: {
  selectedAccount: string;
  selectedGroupNumber: number | null;
  selectedIncomeCats: string[];
  selectedExpenseCats: string[];
  visibleIncomeCategories: Category[];
  visibleExpenseCategories: Category[];
}) {
  const [trendData, setTrendData] = useState<{ month: string; income: number; expenses: number }[]>([]);

  useEffect(() => {
    let alive = true;
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), 1);
    const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthsKeys = Array.from({ length: 6 }, (_, i) => fmt(new Date(start.getFullYear(), start.getMonth() + i, 1)));
    const monthLabel = (ym: string) => {
      const [y, m] = ym.split('-').map(Number);
      return new Date(y, (m || 1) - 1, 1).toLocaleString(undefined, { month: 'short' });
    };
    const accountIds = selectedAccount !== 'all' ? [selectedAccount] : undefined;
    const groupId = selectedGroupNumber ?? undefined;
    const visibleIncomeSet = new Set(visibleIncomeCategories.map(c => c.id));
    const visibleExpenseSet = new Set(visibleExpenseCategories.map(c => c.id));
    const incomeCategoryIds = selectedIncomeCats.length ? selectedIncomeCats.filter(id => visibleIncomeSet.has(id)) : undefined;
    const expenseCategoryIds = selectedExpenseCats.length ? selectedExpenseCats.filter(id => visibleExpenseSet.has(id)) : undefined;

    (async () => {
      try {
        const [incSeries, expSeries] = await Promise.all([
          fetchIncomeMonthly({ fromMonth: monthsKeys[0], toMonth: fmt(end), accountIds, categoryIds: incomeCategoryIds, groupId }),
          fetchExpenseMonthly({ fromMonth: monthsKeys[0], toMonth: fmt(end), accountIds, categoryIds: expenseCategoryIds, groupId }),
        ]);
        if (!alive) return;
        setTrendData(monthsKeys.map((k) => ({ month: monthLabel(k), income: Number(incSeries[k] || 0), expenses: Number(expSeries[k] || 0) })));
      } catch {
        if (alive) setTrendData(monthsKeys.map(k => ({ month: monthLabel(k), income: 0, expenses: 0 })));
      }
    })();
    return () => { alive = false; };
  }, [selectedAccount, selectedIncomeCats.join(','), selectedExpenseCats.join(','), visibleIncomeCategories.length, visibleExpenseCategories.length, selectedGroupNumber]);

  return trendData;
}
