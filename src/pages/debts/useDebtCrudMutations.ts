import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { createDebt, DEBTS_QUERY_KEY, deleteDebt, updateDebt } from "@/lib/debts";
import type { CreateDebtPayload, UpdateDebtPayload } from "@/lib/types";

function errorDescription(error: unknown) {
  return error instanceof Error ? error.message : "Intenta nuevamente.";
}

export function useDebtCrudMutations({
  onSaved,
  onDeleted,
}: {
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: DEBTS_QUERY_KEY });

  const createMutation = useMutation({
    mutationFn: (payload: CreateDebtPayload) => createDebt(payload),
    onSuccess: async () => {
      toast({ title: "Deuda creada", description: "La deuda fue registrada correctamente." });
      onSaved();
      await invalidate();
    },
    onError: (error) =>
      toast({ title: "No se pudo crear la deuda", description: errorDescription(error), variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDebtPayload }) => updateDebt(id, payload),
    onSuccess: async () => {
      toast({ title: "Deuda actualizada", description: "Los cambios se guardaron correctamente." });
      onSaved();
      await invalidate();
    },
    onError: (error) =>
      toast({ title: "No se pudo actualizar la deuda", description: errorDescription(error), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDebt(id),
    onSuccess: async () => {
      toast({ title: "Deuda eliminada", description: "La deuda se eliminó correctamente." });
      onDeleted();
      await invalidate();
    },
    onError: (error) =>
      toast({ title: "No se pudo eliminar la deuda", description: errorDescription(error), variant: "destructive" }),
  });

  return { createMutation, updateMutation, deleteMutation };
}
