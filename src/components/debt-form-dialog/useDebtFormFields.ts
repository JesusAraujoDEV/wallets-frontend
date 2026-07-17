import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Debt, DebtType } from "@/lib/types";
import type { DebtFormValues } from "./types";

const emptyValues = (type: DebtType, dueDate: string): DebtFormValues => ({
  contactName: "",
  description: "",
  totalAmount: undefined as unknown as number,
  currency: "USD",
  type,
  dueDate,
  categoryId: "",
});

export function useDebtFormFields(
  open: boolean,
  debt: Debt | null,
  initialDate: string | undefined,
  initialType: DebtType | undefined,
) {
  const form = useForm<DebtFormValues>({
    defaultValues: emptyValues("payable", ""),
  });
  const { reset } = form;

  useEffect(() => {
    if (!open) return;

    if (debt) {
      reset({
        contactName: debt.contactName,
        description: debt.description,
        totalAmount: debt.totalAmount,
        currency: debt.currency,
        type: debt.type,
        dueDate: debt.dueDate || "",
        categoryId: debt.categoryId || "",
      });
      return;
    }

    reset(emptyValues(initialType ?? "payable", initialDate ?? ""));
  }, [open, debt, initialDate, initialType, reset]);

  return form;
}
