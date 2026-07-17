import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import {
  createRecurringTransaction,
  deleteRecurringTransaction,
  RECURRING_TRANSACTIONS_QUERY_KEY,
  updateRecurringTransaction,
} from "@/lib/subscriptions";
import type { RecurringTransactionPayload, UpdateRecurringTransactionPayload } from "@/lib/types";

function errorDescription(error: unknown) {
  return error instanceof Error ? error.message : "Intenta nuevamente.";
}

export function useSubscriptionCrudMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: RECURRING_TRANSACTIONS_QUERY_KEY });

  const createMutation = useMutation({
    mutationFn: (payload: RecurringTransactionPayload) => createRecurringTransaction(payload),
    onSuccess: async () => {
      toast({ title: "Suscripción creada", description: "La suscripción recurrente fue creada correctamente." });
      await invalidate();
    },
    onError: (error) => toast({ title: "No se pudo crear la suscripción", description: errorDescription(error), variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRecurringTransactionPayload }) => updateRecurringTransaction(id, payload),
    onSuccess: async () => {
      toast({ title: "Suscripción actualizada", description: "Los cambios se guardaron correctamente." });
      await invalidate();
    },
    onError: (error) => toast({ title: "No se pudo actualizar la suscripción", description: errorDescription(error), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRecurringTransaction(id),
    onSuccess: async () => {
      toast({ title: "Suscripción eliminada", description: "La suscripción se eliminó correctamente." });
      await invalidate();
    },
    onError: (error) => toast({ title: "No se pudo eliminar la suscripción", description: errorDescription(error), variant: "destructive" }),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => {
      setTogglingId(id);
      return updateRecurringTransaction(id, { isActive });
    },
    onSuccess: invalidate,
    onError: (error) => toast({ title: "No se pudo actualizar la suscripción", description: errorDescription(error), variant: "destructive" }),
    onSettled: () => setTogglingId(null),
  });

  return { createMutation, updateMutation, deleteMutation, toggleActiveMutation, togglingId };
}
