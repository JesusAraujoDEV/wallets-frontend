import type { Debt } from "@/lib/types";

export interface LinkTransactionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debt: Debt | null;
  onLinked: (count: number) => void;
}

export function fmtCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("es", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
