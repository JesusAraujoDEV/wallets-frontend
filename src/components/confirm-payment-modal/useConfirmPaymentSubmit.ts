import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { confirmPendingTransaction } from "@/lib/subscriptions";
import type { Transaction } from "@/lib/types";
import type { Currency } from "./types";

interface UseConfirmPaymentSubmitArgs {
  pendingTx: Transaction | null;
  selectedAccountId: string;
  finalAmount: string;
  paymentDate: string;
  finalCurrency: Currency;
  onOpenChange: (open: boolean) => void;
  onConfirmed: () => void;
}

export function useConfirmPaymentSubmit({
  pendingTx, selectedAccountId, finalAmount, paymentDate, finalCurrency, onOpenChange, onConfirmed,
}: UseConfirmPaymentSubmitArgs) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!pendingTx) return;
    if (!selectedAccountId) {
      toast({ title: "Cuenta requerida", description: "Selecciona una cuenta para continuar.", variant: "destructive" });
      return;
    }
    if (!finalAmount || Number(finalAmount) <= 0) {
      toast({ title: "Monto inválido", description: "Ingresa un monto válido.", variant: "destructive" });
      return;
    }
    try {
      setSubmitting(true);
      await confirmPendingTransaction(pendingTx.id, {
        date: paymentDate,
        accountId: Number(selectedAccountId),
        amount: Number(finalAmount),
        currency: finalCurrency,
      });
      toast({ title: "Pago confirmado", description: "La transacción se registró correctamente." });
      onOpenChange(false);
      onConfirmed();
    } catch (err) {
      toast({
        title: "No se pudo confirmar el pago",
        description: err instanceof Error ? err.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, handleConfirm };
}
