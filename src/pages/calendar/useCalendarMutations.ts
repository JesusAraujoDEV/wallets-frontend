import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { createDebt, DEBTS_QUERY_KEY, payDebt } from "@/lib/debts";
import { PENDING_TRANSACTIONS_QUERY_KEY, RECURRING_TRANSACTIONS_QUERY_KEY, payNowRecurringTransaction } from "@/lib/subscriptions";

export function useCalendarMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createDebtMutation = useMutation({
    mutationFn: createDebt,
    onSuccess: async () => {
      toast({ title: "Deuda creada", description: "La deuda fue registrada correctamente." });
      await queryClient.invalidateQueries({ queryKey: DEBTS_QUERY_KEY });
    },
    onError: (error) => {
      toast({
        title: "No se pudo crear la deuda",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const payDebtMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { amount: number; currency: string; accountId: number; date: string; categoryId?: number; exchangeRate?: number } }) =>
      payDebt(id, payload),
    onSuccess: async () => {
      toast({ title: "Pago de deuda registrado", description: "Se actualizó el saldo correctamente." });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: DEBTS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: RECURRING_TRANSACTIONS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: PENDING_TRANSACTIONS_QUERY_KEY }),
      ]);
    },
    onError: (error) => {
      toast({
        title: "No se pudo registrar el pago de deuda",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const payNowMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { accountId: number; amount: number; currency: "USD" | "EUR" | "VES"; date: string } }) =>
      payNowRecurringTransaction(id, payload),
    onSuccess: async () => {
      toast({ title: "Cobro/Pago recurrente registrado", description: "Se procesó correctamente." });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: RECURRING_TRANSACTIONS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: PENDING_TRANSACTIONS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: DEBTS_QUERY_KEY }),
      ]);
    },
    onError: (error) => {
      toast({
        title: "No se pudo ejecutar la acción rápida",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  return { createDebtMutation, payDebtMutation, payNowMutation };
}
