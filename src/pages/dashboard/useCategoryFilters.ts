import { useEffect, useMemo, useState } from "react";
import type { Category } from "@/lib/types";

// Income/expense category multi-select state, persisted across sessions, plus
// the derived name-sets the chart-filtering logic needs.
export function useCategoryFilters(categories: Category[], selectedGroupNumber: number | null) {
  const [selectedIncomeCats, setSelectedIncomeCats] = useState<string[]>([]);
  const [selectedExpenseCats, setSelectedExpenseCats] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("dashboard.categoryFilters");
      if (!raw) return;
      const parsed = JSON.parse(raw) as { income: string[]; expense: string[] } | null;
      if (!parsed) return;
      const catIds = new Set(categories.map((c) => c.id));
      setSelectedIncomeCats((parsed.income || []).filter((id) => catIds.has(id)));
      setSelectedExpenseCats((parsed.expense || []).filter((id) => catIds.has(id)));
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.length]);

  useEffect(() => {
    localStorage.setItem("dashboard.categoryFilters", JSON.stringify({ income: selectedIncomeCats, expense: selectedExpenseCats }));
  }, [selectedIncomeCats, selectedExpenseCats]);

  const expenseFilterSet = useMemo(() => new Set(selectedExpenseCats), [selectedExpenseCats]);
  const incomeCategories = useMemo(() => categories.filter(c => c.type === "income"), [categories]);
  const expenseCategories = useMemo(() => categories.filter(c => c.type === "expense"), [categories]);
  const visibleIncomeCategories = useMemo(() => (
    selectedGroupNumber === null ? incomeCategories : incomeCategories.filter((c) => c.groupId === selectedGroupNumber)
  ), [incomeCategories, selectedGroupNumber]);
  const visibleExpenseCategories = useMemo(() => (
    selectedGroupNumber === null ? expenseCategories : expenseCategories.filter((c) => c.groupId === selectedGroupNumber)
  ), [expenseCategories, selectedGroupNumber]);
  const visibleExpenseCategoryNames = useMemo(() => new Set(visibleExpenseCategories.map(c => c.name)), [visibleExpenseCategories]);
  const visibleIncomeCategoryNames = useMemo(() => new Set(visibleIncomeCategories.map(c => c.name)), [visibleIncomeCategories]);
  const selectedExpenseCategoryNames = useMemo(() => (
    selectedExpenseCats.length
      ? new Set(categories.filter(c => c.type === 'expense' && selectedExpenseCats.includes(c.id)).map(c => c.name))
      : new Set<string>()
  ), [categories, selectedExpenseCats]);
  const selectedIncomeCategoryNames = useMemo(() => (
    selectedIncomeCats.length
      ? new Set(categories.filter(c => c.type === 'income' && selectedIncomeCats.includes(c.id)).map(c => c.name))
      : new Set<string>()
  ), [categories, selectedIncomeCats]);

  return {
    selectedIncomeCats, setSelectedIncomeCats, selectedExpenseCats, setSelectedExpenseCats,
    expenseFilterSet, visibleIncomeCategories, visibleExpenseCategories,
    visibleIncomeCategoryNames, visibleExpenseCategoryNames,
    selectedIncomeCategoryNames, selectedExpenseCategoryNames,
  };
}
