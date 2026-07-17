import { useCallback, useMemo, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { deleteBudget } from "@/lib/budgets";
import type { BudgetStatus } from "@/lib/types";

export function useDeleteBudget(budgets: BudgetStatus[], reload: () => Promise<void>) {
  const [confirmDeleteBudgetId, setConfirmDeleteBudgetId] = useState<string | null>(null);
  const [deletingBudgetId, setDeletingBudgetId] = useState<string | null>(null);
  const { toast } = useToast();

  const budgetPendingDelete = useMemo(
    () => budgets.find((budget) => budget.id === confirmDeleteBudgetId) ?? null,
    [budgets, confirmDeleteBudgetId],
  );

  const handleDeleteBudget = useCallback(async () => {
    if (!confirmDeleteBudgetId) {
      return;
    }

    setDeletingBudgetId(confirmDeleteBudgetId);
    try {
      await deleteBudget(confirmDeleteBudgetId);
      toast({ title: "Presupuesto eliminado", description: "La tarjeta se eliminó correctamente." });
      setConfirmDeleteBudgetId(null);
      await reload();
    } catch (error) {
      toast({
        title: "No se pudo eliminar el presupuesto",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setDeletingBudgetId(null);
    }
  }, [confirmDeleteBudgetId, reload, toast]);

  return { confirmDeleteBudgetId, setConfirmDeleteBudgetId, deletingBudgetId, budgetPendingDelete, handleDeleteBudget };
}
