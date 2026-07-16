import { useMemo } from "react";
import { isBalanceAdjustmentCategory } from "@/lib/utils";
import type { Category, Transaction } from "@/lib/types";

export function useGroupedTransactions(transactions: Transaction[], filterType: "all" | "income" | "expense", isAnyFilterActive: boolean, categories: Category[]) {
  const filteredTransactions = useMemo(() => {
    const byType = filterType === 'all' ? transactions : transactions.filter(t => t.type === filterType);
    if (!isAnyFilterActive) return byType;
    return byType.filter(t => {
      const cat = categories.find(c => c.id === t.categoryId);
      return !isBalanceAdjustmentCategory(cat?.name);
    });
  }, [transactions, filterType, isAnyFilterActive, categories]);

  const groupedTransactions = useMemo(() => {
    const sorted = [...filteredTransactions].sort((a, b) => {
      const ad = String(a.date || '').slice(0, 10);
      const bd = String(b.date || '').slice(0, 10);
      if (ad === bd) {
        const an = Number(a.id), bn = Number(b.id);
        if (!Number.isNaN(an) && !Number.isNaN(bn)) return bn - an;
        return String(b.id).localeCompare(String(a.id));
      }
      return bd.localeCompare(ad);
    });
    return sorted.reduce((groups, tx) => {
      const dateKey = tx.date ? String(tx.date).slice(0, 10) : '';
      (groups[dateKey] ||= []).push(tx);
      return groups;
    }, {} as Record<string, Transaction[]>);
  }, [filteredTransactions]);

  return { filteredTransactions, groupedTransactions };
}
