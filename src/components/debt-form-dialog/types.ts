import type { Category, Debt, DebtType } from "@/lib/types";

export type DebtFormValues = {
  contactName: string;
  description: string;
  totalAmount: number;
  currency: "USD" | "EUR" | "VES";
  type: DebtType;
  dueDate: string;
  categoryId: string;
};

export interface DebtFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debt: Debt | null;
  initialDate?: string;
  initialType?: DebtType;
  lockType?: boolean;
  categories: Category[];
  submitting: boolean;
  onSubmit: (values: DebtFormValues) => void;
}
