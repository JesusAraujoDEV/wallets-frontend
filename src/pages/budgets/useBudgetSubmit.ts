import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { createBudget, updateBudget } from "@/lib/budgets";
import type { BudgetStatus } from "@/lib/types";
import type { BudgetFormValues } from "./types";

export function useBudgetSubmit({ form, editingBudget, isEditing, onSuccess, reload }: {
  form: UseFormReturn<BudgetFormValues>;
  editingBudget: BudgetStatus | null;
  isEditing: boolean;
  onSuccess: () => void;
  reload: () => Promise<void>;
}) {
  const [submitLoading, setSubmitLoading] = useState(false);
  const { toast } = useToast();

  const onSubmitBudget = form.handleSubmit(async (values) => {
    if (!Number.isFinite(values.amount) || values.amount <= 0) {
      toast({ title: "Monto inválido", description: "El monto del presupuesto debe ser mayor a cero.", variant: "destructive" });
      return;
    }

    if (values.period === "one_time" && !/^\d{4}-\d{2}$/.test(values.specific_month)) {
      toast({
        title: "Mes específico inválido",
        description: "Para presupuestos de única vez debes indicar un mes con formato YYYY-MM.",
        variant: "destructive",
      });
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = {
        amount: values.amount,
        period: values.period,
        specific_month: values.period === "one_time" ? values.specific_month : null,
        categoryId: values.categoryId === "global" ? null : Number(values.categoryId),
      };

      if (isEditing && editingBudget) {
        await updateBudget(editingBudget.id, payload);
      } else {
        await createBudget(payload);
      }

      toast({
        title: isEditing ? "Presupuesto actualizado" : "Presupuesto creado",
        description: isEditing ? "El monto se actualizó correctamente." : "El presupuesto se guardó correctamente.",
      });
      onSuccess();
      await reload();
    } catch (error) {
      toast({
        title: isEditing ? "No se pudo actualizar el presupuesto" : "No se pudo crear el presupuesto",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitLoading(false);
    }
  });

  return { submitLoading, onSubmitBudget };
}
