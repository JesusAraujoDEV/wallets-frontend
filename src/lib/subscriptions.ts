import { apiFetch } from "@/lib/http";
import type {
  ConfirmPendingTransactionPayload,
  PayNowRecurringPayload,
  PayNowRecurringResponse,
  RecurringTransaction,
  RecurringTransactionPayload,
  Transaction,
  TriggerRecurringResponse,
  UpdateRecurringTransactionPayload,
} from "@/lib/types";
import { mapServerTransaction } from "@/lib/transactions";

export const RECURRING_TRANSACTIONS_QUERY_KEY = ["subscriptions", "recurring-transactions"] as const;
export const PENDING_TRANSACTIONS_QUERY_KEY = ["subscriptions", "pending-transactions"] as const;

type ApiRecurringTransaction = {
  id: number | string;
  amount: number | string;
  description: string;
  frequency: string;
  next_date: string;
  execution_mode: "auto" | "manual" | string;
  is_active: boolean;
  categoryId?: number | string;
  accountId?: number | string;
  category_id?: number | string;
  account_id?: number | string;
  currency?: string;
};

function mapRecurringTransaction(item: any): RecurringTransaction {
  // Soporta tanto snake_case como camelCase
  const rawCurrency = item.currency;
  const currency: "USD" | "EUR" | "VES" = rawCurrency === "EUR" ? "EUR" : rawCurrency === "VES" ? "VES" : "USD";
  return {
    id: String(item.id),
    amount: Number(item.amount || 0),
    description: String(item.description || ""),
    frequency: String(item.frequency || item.frequency || "monthly"),
    next_date: String(item.next_date ?? item.nextDate ?? ""),
    execution_mode: (item.execution_mode ?? item.executionMode) === "auto" ? "auto" : "manual",
    is_active: Boolean(item.is_active ?? item.isActive),
    categoryId: String(item.categoryId ?? item.category_id ?? ""),
    accountId: String(item.accountId ?? item.account_id ?? ""),
    currency,
  };
}

export async function fetchRecurringTransactions(): Promise<RecurringTransaction[]> {
  const response = await apiFetch<ApiRecurringTransaction[] | { data?: ApiRecurringTransaction[] }>("recurring-transactions", {
    method: "GET",
  });
  const list = Array.isArray(response) ? response : response?.data ?? [];
  return list.map(mapRecurringTransaction);
}

export async function createRecurringTransaction(payload: RecurringTransactionPayload): Promise<RecurringTransaction> {
  const response = await apiFetch<ApiRecurringTransaction>("recurring-transactions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return mapRecurringTransaction(response);
}

export async function updateRecurringTransaction(id: string, payload: UpdateRecurringTransactionPayload): Promise<RecurringTransaction> {
  const response = await apiFetch<ApiRecurringTransaction>(`recurring-transactions/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return mapRecurringTransaction(response);
}

export async function deleteRecurringTransaction(id: string): Promise<{ ok?: boolean; success?: boolean; message?: string }> {
  return apiFetch<{ ok?: boolean; success?: boolean; message?: string }>(`recurring-transactions/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function triggerRecurringTransactions(): Promise<TriggerRecurringResponse> {
  return apiFetch<TriggerRecurringResponse>("recurring-transactions/trigger", {
    method: "POST",
  });
}

export async function confirmPendingTransaction(id: string, payload: ConfirmPendingTransactionPayload): Promise<Transaction> {
  const response = await apiFetch<unknown>(`transactions/${encodeURIComponent(id)}/confirm`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return mapServerTransaction(response);
}

export async function fetchPendingTransactions(): Promise<Transaction[]> {
  const response = await apiFetch<unknown>("transactions?grouped=0", {
    method: "GET",
  });

  const list = Array.isArray(response)
    ? response
    : typeof response === "object" && response !== null && "items" in response
      ? ((response as { items?: unknown[] }).items ?? [])
      : [];

  return list
    .map(mapServerTransaction)
    .filter((tx) => tx.status === "pending");
}

export async function payNowRecurringTransaction(
  id: string,
  payload?: PayNowRecurringPayload,
): Promise<PayNowRecurringResponse> {
  return apiFetch<PayNowRecurringResponse>(
    `recurring-transactions/${encodeURIComponent(id)}/pay-now`,
    { method: "POST", body: JSON.stringify(payload ?? {}) },
  );
}
