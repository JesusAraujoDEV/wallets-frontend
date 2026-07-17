import type { RecurringExecutionMode } from "@/lib/types";

export const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Diaria" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensual" },
  { value: "yearly", label: "Anual" },
] as const;

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

export interface SubscriptionCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType?: "gasto" | "ingreso";
  lockType?: boolean;
  onCreated?: () => Promise<void> | void;
}

export const INITIAL_VALUES: CreateSubscriptionForm = {
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
