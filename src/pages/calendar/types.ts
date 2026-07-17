import type { Category, Debt, RecurringTransaction, Transaction } from "@/lib/types";

export const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export type CalendarEvent = {
  id: string;
  label: string;
  date: string;
  source: "subscription" | "debt" | "pending";
  flow: "income" | "expense";
  amount: number;
  currency: "USD" | "EUR" | "VES";
  status?: "pending" | "partial" | "paid" | "completed";
  debt?: Debt;
  subscription?: RecurringTransaction;
  pendingTx?: Transaction;
};

export function buildEvents(
  subscriptions: RecurringTransaction[],
  debts: Debt[],
  pendingTxs: Transaction[],
  categories: Category[],
): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  const categoryTypeById = new Map<string, "income" | "expense">();
  for (const category of categories) {
    categoryTypeById.set(category.id, category.type);
  }

  for (const sub of subscriptions) {
    if (!sub.is_active || !sub.next_date) continue;
    const categoryType = categoryTypeById.get(sub.categoryId) ?? "expense";
    events.push({
      id: `sub-${sub.id}`,
      label: sub.description,
      date: sub.next_date,
      source: "subscription",
      flow: categoryType,
      amount: sub.amount,
      currency: sub.currency,
      subscription: sub,
    });
  }

  for (const debt of debts) {
    if (debt.status === "paid" || !debt.dueDate) continue;
    events.push({
      id: `debt-${debt.id}`,
      label: debt.contactName,
      date: debt.dueDate,
      source: "debt",
      flow: debt.type === "payable" ? "expense" : "income",
      amount: debt.remaining,
      currency: debt.currency,
      status: debt.status,
      debt,
    });
  }

  for (const tx of pendingTxs) {
    events.push({
      id: `pending-${tx.id}`,
      label: tx.description || "Pago pendiente",
      date: tx.date,
      source: "pending",
      flow: tx.type,
      amount: tx.amount,
      currency: tx.currency ?? "USD",
      status: tx.status === "completed" ? "completed" : "pending",
      pendingTx: tx,
    });
  }

  return events;
}
