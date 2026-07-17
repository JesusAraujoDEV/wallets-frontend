import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseFormHandleSubmit, UseFormReset } from "react-hook-form";

import { useToast } from "@/components/ui/use-toast";
import {
  createRecurringTransaction,
  RECURRING_TRANSACTIONS_QUERY_KEY,
} from "@/lib/subscriptions";
import type { RecurringTransactionPayload } from "@/lib/types";
import { INITIAL_VALUES, type CreateSubscriptionForm } from "./types";

export function useCreateSubscriptionMutation({
  handleSubmit,
  reset,
  onOpenChange,
  onCreated,
}: {
  handleSubmit: UseFormHandleSubmit<CreateSubscriptionForm>;
  reset: UseFormReset<CreateSubscriptionForm>;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => Promise<void> | void;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: (payload: RecurringTransactionPayload) => createRecurringTransaction(payload),
    onSuccess: async () => {
      toast({
        title: "Suscripción creada",
        description: "La suscripción recurrente fue creada correctamente.",
      });
      onOpenChange(false);
      reset({
        ...INITIAL_VALUES,
        next_date: new Date().toISOString().slice(0, 10),
      });
      await queryClient.invalidateQueries({ queryKey: RECURRING_TRANSACTIONS_QUERY_KEY });
      if (onCreated) await onCreated();
    },
    onError: (error) => {
      toast({
        title: "No se pudo crear la suscripción",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmitCreate = handleSubmit((values) => {
    if (!values.categoryId) {
      toast({
        title: "Campos incompletos",
        description: "Selecciona una categoría para crear la suscripción.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      description: values.description.trim(),
      amount: Number(values.amount),
      frequency: values.frequency,
      next_date: values.next_date,
      start_date: values.next_date,
      type: values.subscriptionType,
      execution_mode: values.execution_mode,
      is_active: values.is_active,
      categoryId: Number(values.categoryId),
      accountId: values.accountId ? Number(values.accountId) : undefined,
      currency: values.currency,
      debtId: values.debtId ? Number(values.debtId) : null,
    });
  });

  return { createMutation, onSubmitCreate };
}
