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
export async function fetchNetCashFlow(params?: { includeInStats?: boolean; accountId?: string; fromDate?: string; toDate?: string; timeUnit?: string; }): Promise<NetCashFlowResponse> {
  // API expects from_date and to_date (YYYY-MM-DD) and optional time_unit (e.g. 'month')
  const sp = new URLSearchParams();
  if (params?.includeInStats === true) sp.set("includeInStats", "1");
  if (params?.includeInStats === false) sp.set("includeInStats", "0");
  if (params?.accountId) sp.set("accountId", params.accountId);
  if (params?.fromDate) sp.set("from_date", params.fromDate);
  if (params?.toDate) sp.set("to_date", params.toDate);
  if (params?.timeUnit) sp.set("time_unit", params.timeUnit);
  const qs = sp.toString();
  return apiFetch<NetCashFlowResponse>(`stats/net-cash-flow${qs ? `?${qs}` : ""}`);
}

// 2) Spending heatmap
export interface SpendingHeatmapResponse {
  categories: string[]; // y axis labels
  weekdays: string[];   // x axis labels
  data_points: Array<{ category_idx: number; day_idx: number; amount: number }>;
}
export async function fetchSpendingHeatmap(params?: { includeInStats?: boolean; accountId?: string; fromDate?: string; toDate?: string; }): Promise<SpendingHeatmapResponse> {
  // API expects from_date and to_date (YYYY-MM-DD)
  const sp = new URLSearchParams();
  if (params?.includeInStats === true) sp.set("includeInStats", "1");
  if (params?.includeInStats === false) sp.set("includeInStats", "0");
  if (params?.accountId) sp.set("accountId", params.accountId);
  if (params?.fromDate) sp.set("from_date", params.fromDate);
  if (params?.toDate) sp.set("to_date", params.toDate);
  const qs = sp.toString();
  return apiFetch<SpendingHeatmapResponse>(`stats/spending-heatmap${qs ? `?${qs}` : ""}`);
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
export async function fetchExpenseVolatility(params?: { includeInStats?: boolean; accountId?: string; fromDate?: string; toDate?: string; topN?: number; }): Promise<ExpenseVolatilityResponse> {
  // API expects from_date and to_date (YYYY-MM-DD) and optional top_n_categories
  const sp = new URLSearchParams();
  if (params?.includeInStats === true) sp.set("includeInStats", "1");
  if (params?.includeInStats === false) sp.set("includeInStats", "0");
  if (params?.accountId) sp.set("accountId", params.accountId);
  if (params?.fromDate) sp.set("from_date", params.fromDate);
  if (params?.toDate) sp.set("to_date", params.toDate);
  if (typeof params?.topN === 'number') sp.set("top_n_categories", String(params.topN));
  const qs = sp.toString();
  return apiFetch<ExpenseVolatilityResponse>(`stats/expense-volatility${qs ? `?${qs}` : ""}`);
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
export async function fetchComparativeMoM(params?: { includeInStats?: boolean; accountId?: string; date?: string; }): Promise<ComparativeMoMResponse> {
  // API expects a reference date (YYYY-MM-DD)
  const sp = new URLSearchParams();
  if (params?.includeInStats === true) sp.set("includeInStats", "1");
  if (params?.includeInStats === false) sp.set("includeInStats", "0");
  if (params?.accountId) sp.set("accountId", params.accountId);
  if (params?.date) sp.set("date", params.date);
  const qs = sp.toString();
  return apiFetch<ComparativeMoMResponse>(`stats/comparative-mom${qs ? `?${qs}` : ""}`);
}

// 5) Monthly forecast
export interface MonthlyForecastResponse {
  budget_total: number;
  current_spending_mtd: number;
  projected_total_spending: number;
  projected_over_under: number; // positive if over
}
export async function fetchMonthlyForecast(params?: { includeInStats?: boolean; accountId?: string; date?: string; budget_total?: number; }): Promise<MonthlyForecastResponse> {
  // API expects a date (YYYY-MM-DD) and optional budget_total
  const sp = new URLSearchParams();
  if (params?.includeInStats === true) sp.set("includeInStats", "1");
  if (params?.includeInStats === false) sp.set("includeInStats", "0");
  if (params?.accountId) sp.set("accountId", params.accountId);
  if (params?.date) sp.set("date", params.date);
  if (typeof params?.budget_total === 'number') sp.set("budget_total", String(params.budget_total));
  const qs = sp.toString();
  return apiFetch<MonthlyForecastResponse>(`stats/monthly-forecast${qs ? `?${qs}` : ""}`);
}

// Income-focused endpoints

// A) Income heatmap
export interface IncomeHeatmapResponse {
  categories: string[];
  weekdays: string[];
  data_points: Array<{ category_idx: number; day_idx: number; amount: number }>;
  summary?: { peak_category?: string; peak_day?: string };
}
export async function fetchIncomeHeatmap(params?: { includeInStats?: boolean; accountId?: string; fromDate?: string; toDate?: string; }): Promise<IncomeHeatmapResponse> {
  const sp = new URLSearchParams();
  if (params?.includeInStats === true) sp.set("includeInStats", "1");
  if (params?.includeInStats === false) sp.set("includeInStats", "0");
  if (params?.accountId) sp.set("accountId", params.accountId);
  if (params?.fromDate) sp.set("from_date", params.fromDate);
  if (params?.toDate) sp.set("to_date", params.toDate);
  const qs = sp.toString();
  return apiFetch<IncomeHeatmapResponse>(`stats/income-heatmap${qs ? `?${qs}` : ""}`);
}

// B) Income volatility
export interface IncomeVolatilityCategory {
  category: string;
  min: number; q1: number; median: number; q3: number; max: number;
  outliers?: number[];
  count?: number;
}
export interface IncomeVolatilityResponse {
  categories_data: IncomeVolatilityCategory[];
}
export async function fetchIncomeVolatility(params?: { includeInStats?: boolean; accountId?: string; fromDate?: string; toDate?: string; topN?: number; }): Promise<IncomeVolatilityResponse> {
  const sp = new URLSearchParams();
  if (params?.includeInStats === true) sp.set("includeInStats", "1");
  if (params?.includeInStats === false) sp.set("includeInStats", "0");
  if (params?.accountId) sp.set("accountId", params.accountId);
  if (params?.fromDate) sp.set("from_date", params.fromDate);
  if (params?.toDate) sp.set("to_date", params.toDate);
  if (typeof params?.topN === 'number') sp.set("top_n_categories", String(params.topN));
  const qs = sp.toString();
  return apiFetch<IncomeVolatilityResponse>(`stats/income-volatility${qs ? `?${qs}` : ""}`);
}

// C) Comparative MoM income
export interface ComparativeMoMIncomeResponse {
  summary: {
    current_total: number;
    total_delta_percent: number;
    total_delta_usd: number;
    current_period_name?: string;
    previous_period_name?: string;
  };
  categories_comparison: Array<{
    category: string;
    current: number; // or current_amount
    previous: number; // or previous_amount
    delta_percent: number;
  }>;
}
export async function fetchComparativeMoMIncome(params?: { includeInStats?: boolean; accountId?: string; date?: string; }): Promise<ComparativeMoMIncomeResponse> {
  const sp = new URLSearchParams();
  if (params?.includeInStats === true) sp.set("includeInStats", "1");
  if (params?.includeInStats === false) sp.set("includeInStats", "0");
  if (params?.accountId) sp.set("accountId", params.accountId);
  if (params?.date) sp.set("date", params.date);
  const qs = sp.toString();
  return apiFetch<ComparativeMoMIncomeResponse>(`stats/comparative-mom-income${qs ? `?${qs}` : ""}`);
}
