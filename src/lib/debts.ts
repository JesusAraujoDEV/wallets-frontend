import { apiFetch } from "@/lib/http";
import type {
  CreateDebtPayload,
  Debt,
  DebtDeleteResponse,
  DebtStatus,
  DebtType,
  LinkPastTransactionsResponse,
  LinkTransactionsPayload,
  LinkTransactionsResponse,
  PayDebtPayload,
  PayDebtResponse,
  Transaction,
  UpdateDebtPayload,
} from "@/lib/types";

export const DEBTS_QUERY_KEY = ["debts"] as const;
type ApiDebt = {
  id: number | string;
  type: string;
  contactName?: string;
  contact_name?: string;
  description?: string;
  totalAmount?: number | string;
  total_amount?: number | string;
  currency?: string;
  dueDate?: string | null;
  due_date?: string | null;
  status?: string;
  paidAmount?: number | string;
  paid_amount?: number | string;
  remaining?: number | string;
  categoryId?: number | string | null;
  category_id?: number | string | null;
};

function mapDebt(item: ApiDebt): Debt {
  const rawCurrency = item.currency;
  const currency: "USD" | "EUR" | "VES" =
    rawCurrency === "EUR" ? "EUR" : rawCurrency === "VES" ? "VES" : "USD";

  const rawType = String(item.type ?? "payable").toLowerCase();
  const type: DebtType = rawType === "receivable" ? "receivable" : "payable";

  const rawStatus = String(item.status ?? "pending").toLowerCase();
  const status: DebtStatus =
    rawStatus === "paid" ? "paid" : rawStatus === "partial" ? "partial" : "pending";

  const totalAmount = Number(item.totalAmount ?? item.total_amount ?? 0);
  const paidAmount = Number(item.paidAmount ?? item.paid_amount ?? 0);

  return {
    id: String(item.id),
    type,
    contactName: String(item.contactName ?? item.contact_name ?? ""),
    description: String(item.description ?? ""),
    totalAmount,
    currency,
    dueDate: item.dueDate ?? item.due_date ?? null,
    status,
    paidAmount,
    remaining: Number(item.remaining ?? totalAmount - paidAmount),
    categoryId: item.categoryId ?? item.category_id ? String(item.categoryId ?? item.category_id) : null,
  };
}

export async function fetchDebts(): Promise<Debt[]> {
  const response = await apiFetch<ApiDebt[] | { data?: ApiDebt[] }>("debts", {
    method: "GET",
  });
  const list = Array.isArray(response) ? response : response?.data ?? [];
  return list.map(mapDebt);
}

export async function createDebt(payload: CreateDebtPayload): Promise<Debt> {
  const response = await apiFetch<ApiDebt>("debts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return mapDebt(response);
}

export async function updateDebt(id: string, payload: UpdateDebtPayload): Promise<Debt> {
  const response = await apiFetch<ApiDebt>(`debts/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return mapDebt(response);
}

export async function deleteDebt(id: string): Promise<DebtDeleteResponse> {
  return apiFetch<DebtDeleteResponse>(`debts/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function payDebt(id: string, payload: PayDebtPayload): Promise<PayDebtResponse> {
  return apiFetch<PayDebtResponse>(`debts/${encodeURIComponent(id)}/pay`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function linkPastTransactions(id: string): Promise<LinkPastTransactionsResponse> {
  return apiFetch<LinkPastTransactionsResponse>(
    `debts/${encodeURIComponent(id)}/link-past-transactions`,
    { method: "POST" },
  );
}

type ApiTransaction = Record<string, unknown>;

function mapApiTransaction(t: ApiTransaction): Transaction {
  return {
    id: String(t.id),
    date: String(t.date ?? ""),
    description: String(t.description ?? ""),
    categoryId: String(t.categoryId ?? t.category_id ?? ""),
    accountId: String(t.accountId ?? t.account_id ?? ""),
    amount: Number(t.amount ?? 0),
    type: (String(t.type ?? "").toLowerCase() === "income" || String(t.type ?? "").toLowerCase() === "ingreso") ? "income" as const : "expense" as const,
    status: undefined,
    currency: (t.currency as "USD" | "EUR" | "VES") || undefined,
    amountUsd: t.amount_usd != null ? Number(t.amount_usd) : t.amountUsd != null ? Number(t.amountUsd) : null,
    exchangeRateUsed: t.exchange_rate_used != null ? Number(t.exchange_rate_used) : t.exchangeRateUsed != null ? Number(t.exchangeRateUsed) : null,
    debtId: t.debtId != null ? String(t.debtId) : t.debt_id != null ? String(t.debt_id) : undefined,
  };
}

function parseTransactionList(response: unknown): Transaction[] {
  const list = Array.isArray(response)
    ? response
    : typeof response === "object" && response !== null && "items" in response
      ? ((response as { items?: unknown[] }).items ?? [])
      : [];
  return list.map((t) => mapApiTransaction(t as ApiTransaction));
}

/** Fetch both unlinked (debtId=null) and already-linked (debtId=debtId) transactions for a category */
export async function fetchLinkableTransactions(categoryId: string, debtId: string): Promise<Transaction[]> {
  const [unlinked, linked] = await Promise.all([
    apiFetch<unknown>(
      `transactions?categoryId=${encodeURIComponent(categoryId)}&debtId=null&grouped=0`,
      { method: "GET" },
    ),
    apiFetch<unknown>(
      `transactions?categoryId=${encodeURIComponent(categoryId)}&debtId=${encodeURIComponent(debtId)}&grouped=0`,
      { method: "GET" },
    ),
  ]);

  const unlinkedTxs = parseTransactionList(unlinked);
  const linkedTxs = parseTransactionList(linked);

  // Deduplicate by id (in case backend returns overlaps)
  const seen = new Set<string>();
  const merged: Transaction[] = [];
  for (const tx of [...linkedTxs, ...unlinkedTxs]) {
    if (!seen.has(tx.id)) {
      seen.add(tx.id);
      merged.push(tx);
    }
  }

  // Sort by date descending
  merged.sort((a, b) => b.date.localeCompare(a.date));
  return merged;
}

export async function linkTransactions(debtId: string, payload: LinkTransactionsPayload): Promise<LinkTransactionsResponse> {
  return apiFetch<LinkTransactionsResponse>(
    `debts/${encodeURIComponent(debtId)}/link-transactions`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}
