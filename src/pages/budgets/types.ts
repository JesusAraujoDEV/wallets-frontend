import type { BudgetPeriod } from "@/lib/types";

export type BudgetFormValues = {
  categoryId: string;
  amount: number;
  period: BudgetPeriod;
  specific_month: string;
};

export const DEFAULT_BUDGET_FORM_VALUES: BudgetFormValues = {
  categoryId: "global",
  amount: undefined as unknown as number,
  period: "monthly",
  specific_month: "",
};
