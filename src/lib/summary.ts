import { apiFetch } from "@/lib/http";

export async function fetchIncomeSummary(params: { month?: string; date?: string; dateFrom?: string; dateTo?: string; includeInStats?: boolean; accountIds?: string[]; categoryIds?: string[]; q?: string; }): Promise<number> {
  const sp = new URLSearchParams();
  // API now supports from_month/to_month; if month provided, use same for both to request that month only
  if (params.month) {
    sp.set("from_month", params.month);
    sp.set("to_month", params.month);
  }
  if (params.date) sp.set("date", params.date);
  if (params.dateFrom) sp.set("dateFrom", params.dateFrom);
  if (params.dateTo) sp.set("dateTo", params.dateTo);
  if (params.includeInStats === true) sp.set("includeInStats", "1");
  if (params.includeInStats === false) sp.set("includeInStats", "0");
  if (params.accountIds && params.accountIds.length) sp.set("accountId", params.accountIds.join(","));
  if (params.categoryIds && params.categoryIds.length) sp.set("categoryId", params.categoryIds.join(","));
  if (params.q && params.q.trim()) sp.set("q", params.q.trim());
  const res = await apiFetch<any>(`summary/income?${sp.toString()}`);
  if (typeof res === 'number') return res;
  if (res && typeof res.income_total === 'number') return res.income_total;
  if (res && typeof res.total === 'number') return res.total;
  if (res && typeof res.amount === 'number') return res.amount;
  return 0;
}

export async function fetchExpenseSummary(params: { month?: string; date?: string; dateFrom?: string; dateTo?: string; includeInStats?: boolean; accountIds?: string[]; categoryIds?: string[]; q?: string; }): Promise<number> {
  const sp = new URLSearchParams();
  if (params.month) {
    sp.set("from_month", params.month);
    sp.set("to_month", params.month);
  }
  if (params.date) sp.set("date", params.date);
  if (params.dateFrom) sp.set("dateFrom", params.dateFrom);
  if (params.dateTo) sp.set("dateTo", params.dateTo);
  if (params.includeInStats === true) sp.set("includeInStats", "1");
  if (params.includeInStats === false) sp.set("includeInStats", "0");
  if (params.accountIds && params.accountIds.length) sp.set("accountId", params.accountIds.join(","));
  if (params.categoryIds && params.categoryIds.length) sp.set("categoryId", params.categoryIds.join(","));
  if (params.q && params.q.trim()) sp.set("q", params.q.trim());
  const res = await apiFetch<any>(`summary/expense?${sp.toString()}`);
  if (typeof res === 'number') return res;
  if (res && typeof res.expense_total === 'number') return res.expense_total;
  if (res && typeof res.total === 'number') return res.total;
  if (res && typeof res.amount === 'number') return res.amount;
  return 0;
}

export async function fetchBalanceSummary(params: { month?: string; date?: string; dateFrom?: string; dateTo?: string; includeInStats?: boolean; accountIds?: string[]; categoryIds?: string[]; q?: string; }): Promise<number> {
  const sp = new URLSearchParams();
  if (params.month) sp.set("month", params.month);
  if (params.date) sp.set("date", params.date);
  if (params.dateFrom) sp.set("dateFrom", params.dateFrom);
  if (params.dateTo) sp.set("dateTo", params.dateTo);
  if (params.includeInStats === true) sp.set("includeInStats", "1");
  if (params.includeInStats === false) sp.set("includeInStats", "0");
  if (params.accountIds && params.accountIds.length) sp.set("accountId", params.accountIds.join(","));
  if (params.categoryIds && params.categoryIds.length) sp.set("categoryId", params.categoryIds.join(","));
  if (params.q && params.q.trim()) sp.set("q", params.q.trim());
  const res = await apiFetch<any>(`summary/balance?${sp.toString()}`);
  if (typeof res === 'number') return res;
  if (res && res.balance && typeof res.balance.net_total_usd === 'number') return res.balance.net_total_usd;
  if (res && typeof res.total === 'number') return res.total;
  if (res && typeof res.amount === 'number') return res.amount;
  return 0;
}

export interface GlobalBalance {
  accounts_total_usd: number;
  income_total_usd: number;
  expense_total_usd: number;
  net_total_usd: number;
}

export async function fetchGlobalBalance(params?: { month?: string; date?: string; dateFrom?: string; dateTo?: string; includeInStats?: boolean; accountIds?: string[]; categoryIds?: string[]; q?: string; }): Promise<GlobalBalance> {
  const sp = new URLSearchParams();
  if (params?.month) sp.set("month", params.month);
  if (params?.date) sp.set("date", params.date);
  if (params?.dateFrom) sp.set("dateFrom", params.dateFrom);
  if (params?.dateTo) sp.set("dateTo", params.dateTo);
  if (params?.includeInStats === true) sp.set("includeInStats", "1");
  if (params?.includeInStats === false) sp.set("includeInStats", "0");
  if (params?.accountIds && params.accountIds.length) sp.set("accountId", params.accountIds.join(","));
  if (params?.categoryIds && params.categoryIds.length) sp.set("categoryId", params.categoryIds.join(","));
  if (params?.q && params.q.trim()) sp.set("q", params.q.trim());
  const qs = sp.toString();
  const url = qs ? `summary/balance?${qs}` : `summary/balance`;
  const res = await apiFetch<any>(url);
  const b = res?.balance || {};
  return {
    accounts_total_usd: Number(b.accounts_total_usd || 0),
    income_total_usd: Number(b.income_total_usd || 0),
    expense_total_usd: Number(b.expense_total_usd || 0),
    net_total_usd: Number(b.net_total_usd || 0),
  };
}

// Helpers to fetch monthly aggregated series for trends
export type MonthlySeries = Record<string, number>; // key: YYYY-MM

function extractMonthly(obj: any, prefix: string): MonthlySeries {
  const out: MonthlySeries = {};
  if (!obj || typeof obj !== 'object') return out;
  for (const k of Object.keys(obj)) {
    if (k.startsWith(prefix + "_")) {
      const month = k.substring(prefix.length + 1); // after `${prefix}_`
      const val = Number((obj as any)[k] ?? 0);
      if (month) out[month] = val;
    }
  }
  return out;
}

export async function fetchIncomeMonthly(params: { fromMonth: string; toMonth?: string; includeInStats?: boolean; accountIds?: string[]; categoryIds?: string[]; q?: string; }): Promise<MonthlySeries> {
  const sp = new URLSearchParams();
  sp.set("from_month", params.fromMonth);
  if (params.toMonth) sp.set("to_month", params.toMonth);
  if (params.includeInStats === true) sp.set("includeInStats", "1");
  if (params.includeInStats === false) sp.set("includeInStats", "0");
  if (params.accountIds && params.accountIds.length) sp.set("accountId", params.accountIds.join(","));
  if (params.categoryIds && params.categoryIds.length) sp.set("categoryId", params.categoryIds.join(","));
  if (params.q && params.q.trim()) sp.set("q", params.q.trim());
  const res = await apiFetch<any>(`summary/income?${sp.toString()}`);
  const first = Array.isArray(res?.income) ? res.income[0] : null;
  return extractMonthly(first, "income");
}

export async function fetchExpenseMonthly(params: { fromMonth: string; toMonth?: string; includeInStats?: boolean; accountIds?: string[]; categoryIds?: string[]; q?: string; }): Promise<MonthlySeries> {
  const sp = new URLSearchParams();
  sp.set("from_month", params.fromMonth);
  if (params.toMonth) sp.set("to_month", params.toMonth);
  if (params.includeInStats === true) sp.set("includeInStats", "1");
  if (params.includeInStats === false) sp.set("includeInStats", "0");
  if (params.accountIds && params.accountIds.length) sp.set("accountId", params.accountIds.join(","));
  if (params.categoryIds && params.categoryIds.length) sp.set("categoryId", params.categoryIds.join(","));
  if (params.q && params.q.trim()) sp.set("q", params.q.trim());
  const res = await apiFetch<any>(`summary/expense?${sp.toString()}`);
  const first = Array.isArray(res?.expense) ? res.expense[0] : null;
  return extractMonthly(first, "expense");
}
