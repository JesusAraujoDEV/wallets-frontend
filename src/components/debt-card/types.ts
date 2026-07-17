import type { Debt } from "@/lib/types";

export interface DebtCardProps {
  debt: Debt;
  onPay: (debt: Debt) => void;
  onEdit: (debt: Debt) => void;
  onDelete: (debt: Debt) => void;
  onLinkPast: (debt: Debt) => void;
}
