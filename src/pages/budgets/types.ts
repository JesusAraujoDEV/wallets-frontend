import type { BudgetPeriod, RateSource } from "@/lib/types";

export type BudgetFormValues = {
  categoryId: string;
  amount: number;
  period: BudgetPeriod;
  specific_month: string;
  rate_source: RateSource | "none";
};

export const DEFAULT_BUDGET_FORM_VALUES: BudgetFormValues = {
  categoryId: "global",
  amount: undefined as unknown as number,
  period: "monthly",
  specific_month: "",
  rate_source: "none",
};
