import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import type { BudgetStatus } from "@/lib/types";
import { DEFAULT_BUDGET_FORM_VALUES, type BudgetFormValues } from "./types";

function budgetToFormValues(budget: BudgetStatus): BudgetFormValues {
  const categoryId = budget.category.id ? String(budget.category.id) : "global";

  return {
    categoryId,
    amount: Number(budget.budgeted || 0),
    period: budget.period,
    specific_month: budget.specific_month ?? "",
  };
}

export function useBudgetFormDialog() {
  const [open, setOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetStatus | null>(null);
  const form = useForm<BudgetFormValues>({ defaultValues: DEFAULT_BUDGET_FORM_VALUES });
  const { reset } = form;

  const resetBudgetForm = useCallback(() => {
    reset(DEFAULT_BUDGET_FORM_VALUES);
  }, [reset]);

  const openCreateDialog = useCallback(() => {
    setEditingBudget(null);
    resetBudgetForm();
    setOpen(true);
  }, [resetBudgetForm]);

  const openEditDialog = useCallback((budget: BudgetStatus) => {
    setEditingBudget(budget);
    reset(budgetToFormValues(budget));
    setOpen(true);
  }, [reset]);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      setEditingBudget(null);
      resetBudgetForm();
    }
  }, [resetBudgetForm]);

  return {
    form,
    open,
    setOpen,
    editingBudget,
    isEditing: editingBudget !== null,
    openCreateDialog,
    openEditDialog,
    handleOpenChange,
  };
}
