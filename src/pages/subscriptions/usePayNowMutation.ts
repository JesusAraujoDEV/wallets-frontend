import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { PENDING_TRANSACTIONS_QUERY_KEY, RECURRING_TRANSACTIONS_QUERY_KEY, payNowRecurringTransaction } from "@/lib/subscriptions";
import type { PayNowRecurringPayload } from "@/lib/types";

export function usePayNowMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PayNowRecurringPayload }) => payNowRecurringTransaction(id, payload),
    onSuccess: async () => {
      toast({ title: "Pago adelantado", description: "La transacción se registró correctamente." });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: PENDING_TRANSACTIONS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: RECURRING_TRANSACTIONS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ["summary"] }),
      ]);
    },
    onError: (error) => {
      toast({
        title: "No se pudo adelantar el pago",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });
}
