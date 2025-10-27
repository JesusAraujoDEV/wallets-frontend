import { buildApiUrl } from "@/lib/http";
import type { Transaction } from "@/lib/types";

export type TransactionFilters = {
  searchQuery: string;
  filterType: "all" | "income" | "expense";
  filterIncomeCategories: string[];
  filterExpenseCategories: string[];
  filterAccounts: string[];
  dateMode: "none" | "day" | "range" | "month";
  filterDate: string; // YYYY-MM-DD
  filterDateFrom: string; // YYYY-MM-DD
  filterDateTo: string; // YYYY-MM-DD
  filterMonth: string; // YYYY-MM
};

export const PAGE_SIZE_DEFAULT = 20;

export function buildTransactionsQuery(filters: TransactionFilters, pageSize = PAGE_SIZE_DEFAULT, cursor?: string | null) {
  const {
    searchQuery,
    filterType,
    filterIncomeCategories,
    filterExpenseCategories,
    filterAccounts,
    dateMode,
    filterDate,
    filterDateFrom,
    filterDateTo,
    filterMonth,
  } = filters;

  const params = new URLSearchParams();
  params.set('grouped', '1');
  params.set('pageSize', String(pageSize));
  if (searchQuery.trim()) params.set('q', searchQuery.trim());
  if (filterType !== 'all') params.set('type', filterType);
  const combinedCats = filterType === 'income'
    ? filterIncomeCategories
    : filterType === 'expense'
      ? filterExpenseCategories
      : [...filterIncomeCategories, ...filterExpenseCategories];
  if (combinedCats.length > 0) params.set('categoryId', combinedCats.join(','));
  if (filterAccounts.length > 0) params.set('accountId', filterAccounts.join(','));
  if (dateMode === 'day' && filterDate) {
    params.set('date', filterDate);
  } else if (dateMode === 'range') {
    if (filterDateFrom) params.set('dateFrom', filterDateFrom);
    if (filterDateTo) params.set('dateTo', filterDateTo);
  } else if (dateMode === 'month' && filterMonth) {
    params.set('month', filterMonth);
  }
  if (cursor) params.set('cursorDate', cursor);
  const path = `transactions?${params.toString()}`;
  return { path, url: buildApiUrl(path) };
}

export function mapServerTransaction(t: any): Transaction {
  const categoryId = String(t.category_id ?? t.categoryId);
  const accountId = String(t.account_id ?? t.accountId);
  const rawType = t.type;
  const type: 'income' | 'expense' = rawType === 'ingreso' ? 'income' : rawType === 'gasto' ? 'expense' : (rawType as any) || 'expense';
  const amount = Number(t.amount ?? 0);
  const amountUsd = t.amount_usd != null ? Number(t.amount_usd) : (t.amountUsd != null ? Number(t.amountUsd) : null);
  const exchangeRateUsed = t.exchange_rate_used != null ? Number(t.exchange_rate_used) : (t.exchangeRateUsed != null ? Number(t.exchangeRateUsed) : null);
  return {
    id: String(t.id),
    description: String(t.description ?? ''),
    amount,
    currency: t.currency || undefined,
    amountUsd,
    exchangeRateUsed,
    date: String(t.date),
    categoryId,
    accountId,
    type,
  } as Transaction;
}
