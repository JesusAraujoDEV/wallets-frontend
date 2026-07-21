import type { RecurringExecutionMode } from "@/lib/types";

export type CreateSubscriptionForm = {
  description: string;
  amount: number;
  frequency: string;
  next_date: string;
  execution_mode: RecurringExecutionMode;
  is_active: boolean;
  categoryId: string;
  accountId: string;
  currency: "USD" | "EUR" | "VES";
  debtId: string;
  subscriptionType: "gasto" | "ingreso";
};

export const FREQUENCY_OPTIONS = [
  { value: "daily", labelKey: "subscriptions.frequencyDaily" },
  { value: "weekly", labelKey: "subscriptions.frequencyWeekly" },
  { value: "monthly", labelKey: "subscriptions.frequencyMonthly" },
  { value: "yearly", labelKey: "subscriptions.frequencyYearly" },
] as const;

export const DEFAULT_SUBSCRIPTION_FORM_VALUES: CreateSubscriptionForm = {
  description: "",
  amount: undefined as unknown as number,
  frequency: "monthly",
  next_date: new Date().toISOString().slice(0, 10),
  execution_mode: "manual",
  is_active: true,
  categoryId: "",
  accountId: "",
  currency: "USD",
  debtId: "",
  subscriptionType: "gasto",
};

export function modeLabelKey(mode: RecurringExecutionMode) {
  return mode === "auto" ? "subscriptions.auto" : "subscriptions.reminder";
}
