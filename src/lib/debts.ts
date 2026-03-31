import { apiFetch } from "@/lib/http";
import type {
  CreateDebtPayload,
  Debt,
  DebtDeleteResponse,
  DebtStatus,
  DebtType,
  PayDebtPayload,
  PayDebtResponse,
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
  dueDate?: string;
  due_date?: string;
  status?: string;
  paidAmount?: number | string;
  paid_amount?: number | string;
  remaining?: number | string;
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
    dueDate: String(item.dueDate ?? item.due_date ?? ""),
    status,
    paidAmount,
    remaining: Number(item.remaining ?? totalAmount - paidAmount),
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
