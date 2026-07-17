import type { Debt } from "@/lib/types";

export function computeDebtProgress(debt: Debt) {
  const progress =
    debt.totalAmount > 0
      ? Math.min((debt.paidAmount / debt.totalAmount) * 100, 100)
      : 0;

  return { progress, isPaid: debt.status === "paid" };
}
