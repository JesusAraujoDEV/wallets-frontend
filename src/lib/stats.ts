import { apiFetch } from "@/lib/http";

// 1) Net cash flow
export interface NetCashFlowPoint {
  period: string; // YYYY-MM
  income: number;
  expense: number;
  net_flow: number; // income - expense
  savings_rate: number; // 0..1
}
export interface NetCashFlowResponse {
  summary?: {
    net_cash_flow?: number;
    income_total?: number;
    expense_total?: number;
    savings_rate_avg?: number;
  };
  time_series: NetCashFlowPoint[];
}
export async function fetchNetCashFlow(params?: { includeInStats?: boolean; accountId?: string; fromMonth?: string; toMonth?: string; }): Promise<NetCashFlowResponse> {
  const sp = new URLSearchParams();
  if (params?.includeInStats === true) sp.set("includeInStats", "1");
  if (params?.includeInStats === false) sp.set("includeInStats", "0");
  if (params?.accountId) sp.set("accountId", params.accountId);
  if (params?.fromMonth) sp.set("from_month", params.fromMonth);
  if (params?.toMonth) sp.set("to_month", params.toMonth);
  const qs = sp.toString();
  return apiFetch<NetCashFlowResponse>(`api/stats/net-cash-flow${qs ? `?${qs}` : ""}`);
}

// 2) Spending heatmap
export interface SpendingHeatmapResponse {
  categories: string[]; // y axis labels
  weekdays: string[];   // x axis labels
  data_points: Array<{ category_idx: number; day_idx: number; amount: number }>;
}
export async function fetchSpendingHeatmap(params?: { includeInStats?: boolean; accountId?: string; }): Promise<SpendingHeatmapResponse> {
  const sp = new URLSearchParams();
  if (params?.includeInStats === true) sp.set("includeInStats", "1");
  if (params?.includeInStats === false) sp.set("includeInStats", "0");
  if (params?.accountId) sp.set("accountId", params.accountId);
  const qs = sp.toString();
  return apiFetch<SpendingHeatmapResponse>(`api/stats/spending-heatmap${qs ? `?${qs}` : ""}`);
}

// 3) Expense volatility (box plot)
export interface ExpenseVolatilityCategory {
  category: string;
  min: number; q1: number; median: number; q3: number; max: number;
  outliers?: number[];
  count?: number;
}
export interface ExpenseVolatilityResponse {
  categories_data: ExpenseVolatilityCategory[];
}
export async function fetchExpenseVolatility(params?: { includeInStats?: boolean; accountId?: string; }): Promise<ExpenseVolatilityResponse> {
  const sp = new URLSearchParams();
  if (params?.includeInStats === true) sp.set("includeInStats", "1");
  if (params?.includeInStats === false) sp.set("includeInStats", "0");
  if (params?.accountId) sp.set("accountId", params.accountId);
  const qs = sp.toString();
  return apiFetch<ExpenseVolatilityResponse>(`api/stats/expense-volatility${qs ? `?${qs}` : ""}`);
}

// 4) Comparative month-over-month
export interface ComparativeMoMResponse {
  summary: {
    current_total: number;
    total_delta_percent: number; // positive means spent more
    total_delta_usd: number;
    current_period_name?: string;
    previous_period_name?: string;
  };
  categories_comparison: Array<{
    category: string;
    current: number;
    previous: number;
    delta_percent: number; // positive means spent more
  }>;
}
export async function fetchComparativeMoM(params?: { includeInStats?: boolean; accountId?: string; fromMonth?: string; toMonth?: string; }): Promise<ComparativeMoMResponse> {
  const sp = new URLSearchParams();
  if (params?.includeInStats === true) sp.set("includeInStats", "1");
  if (params?.includeInStats === false) sp.set("includeInStats", "0");
  if (params?.accountId) sp.set("accountId", params.accountId);
  if (params?.fromMonth) sp.set("from_month", params.fromMonth);
  if (params?.toMonth) sp.set("to_month", params.toMonth);
  const qs = sp.toString();
  return apiFetch<ComparativeMoMResponse>(`api/stats/comparative-mom${qs ? `?${qs}` : ""}`);
}

// 5) Monthly forecast
export interface MonthlyForecastResponse {
  budget_total: number;
  current_spending_mtd: number;
  projected_total_spending: number;
  projected_over_under: number; // positive if over
}
export async function fetchMonthlyForecast(params?: { includeInStats?: boolean; accountId?: string; month?: string; }): Promise<MonthlyForecastResponse> {
  const sp = new URLSearchParams();
  if (params?.includeInStats === true) sp.set("includeInStats", "1");
  if (params?.includeInStats === false) sp.set("includeInStats", "0");
  if (params?.accountId) sp.set("accountId", params.accountId);
  if (params?.month) sp.set("month", params.month);
  const qs = sp.toString();
  return apiFetch<MonthlyForecastResponse>(`api/stats/monthly-forecast${qs ? `?${qs}` : ""}`);
}
