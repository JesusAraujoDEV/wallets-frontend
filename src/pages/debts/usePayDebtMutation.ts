import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { DEBTS_QUERY_KEY, payDebt } from "@/lib/debts";
import { AccountsStore } from "@/lib/storage";

type PayDebtPayload = {
  amount: number;
  currency: string;
  accountId: number;
  date: string;
  categoryId?: number;
  exchangeRate?: number;
};

export function usePayDebtMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PayDebtPayload }) => payDebt(id, payload),
    onSuccess: async () => {
      toast({ title: "Abono registrado", description: "El pago se registró correctamente." });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: DEBTS_QUERY_KEY }),
        AccountsStore.refresh(),
      ]);
    },
    onError: (error) => {
      toast({
        title: "No se pudo registrar el abono",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });
}
