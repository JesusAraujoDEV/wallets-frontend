import { apiFetch } from "@/lib/http";
import type {
  Budget,
  BudgetDeleteResponse,
  BudgetPeriod,
  BudgetStatus,
  CreateBudgetPayload,
  RateSource,
  UpdateBudgetPayload,
} from "@/lib/types";

type ApiBudgetCategory = {
  id: number | string;
  name: string;
  icon?: string | null;
  color?: string;
  colorName?: string;
};

type ApiBudgetStatus = {
  id: number | string;
  category: ApiBudgetCategory | string;
  budgeted: number;
  budgeted_original?: number | null;
  period?: BudgetPeriod | string;
  specific_month?: string | null;
  rate_source?: RateSource | null;
  spent: number;
  remaining: number;
  percentageUsed: number;
};

type ApiBudget = {
  id: number | string;
  categoryId?: number | string | null;
  category_id?: number | string | null;
  amount?: number;
  budgeted?: number;
  period?: BudgetPeriod | string;
  specific_month?: string | null;
  rate_source?: RateSource | null;
};

type ApiBudgetResponse = ApiBudget | { data: ApiBudget };

function unwrapBudget(response: ApiBudgetResponse): ApiBudget {
  return "data" in response ? response.data : response;
}

function normalizeBudgetPeriod(period?: string): BudgetPeriod {
  if (period === "yearly" || period === "one_time") {
    return period;
  }

  return "monthly";
}

function mapBudgetStatus(item: ApiBudgetStatus): BudgetStatus {
  const category = typeof item.category === "string"
    ? {
      id: "",
      name: item.category,
      icon: null,
      color: "hsl(var(--chart-2))",
      colorName: "",
    }
    : {
      id: String(item.category.id),
      name: String(item.category.name),
      icon: item.category.icon ?? null,
      color: item.category.color,
      colorName: item.category.colorName,
    };

  return {
    id: String(item.id),
    category,
    budgeted: Number(item.budgeted || 0),
    budgeted_original: item.budgeted_original ?? null,
    period: normalizeBudgetPeriod(item.period),
    specific_month: item.specific_month ?? null,
    rate_source: item.rate_source ?? null,
    spent: Number(item.spent || 0),
    remaining: Number(item.remaining || 0),
    percentageUsed: Number(item.percentageUsed || 0),
  };
}

function mapBudget(item: ApiBudget): Budget {
  return {
    id: String(item.id),
    categoryId: String(item.categoryId ?? item.category_id ?? ""),
    budgeted: Number(item.amount ?? item.budgeted ?? 0),
    period: normalizeBudgetPeriod(item.period),
    specific_month: item.specific_month ?? null,
    rate_source: item.rate_source ?? null,
  };
}

export async function fetchBudgetsStatus(): Promise<BudgetStatus[]> {
  const response = await apiFetch<ApiBudgetStatus[] | { data?: ApiBudgetStatus[] }>("budgets/status", {
    method: "GET",
  });

  const list = Array.isArray(response) ? response : response?.data ?? [];
  return list.map(mapBudgetStatus);
}

export async function fetchBudgets(): Promise<Budget[]> {
  const response = await apiFetch<ApiBudget[] | { data?: ApiBudget[] }>("budgets", {
    method: "GET",
  });

  const list = Array.isArray(response) ? response : response?.data ?? [];
  return list.map(mapBudget);
}

export async function createBudget(payload: CreateBudgetPayload): Promise<Budget> {
  const response = await apiFetch<ApiBudgetResponse>("budgets", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return mapBudget(unwrapBudget(response));
}

export async function updateBudget(id: string, payload: UpdateBudgetPayload): Promise<Budget> {
  const response = await apiFetch<ApiBudgetResponse>(`budgets/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  return mapBudget(unwrapBudget(response));
}

export async function deleteBudget(id: string): Promise<BudgetDeleteResponse> {
  return apiFetch<BudgetDeleteResponse>(`budgets/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
