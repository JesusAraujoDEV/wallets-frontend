import { useToast } from "@/components/ui/use-toast";
import type { RecurringTransaction } from "@/lib/types";
import type { Currency, PayNowModalProps } from "./types";

interface ConfirmParams {
  subscription: RecurringTransaction | null;
  selectedAccountId: string;
  finalAmount: string;
  finalCurrency: Currency;
  paymentDate: string;
  onConfirm: PayNowModalProps["onConfirm"];
  onOpenChange: (open: boolean) => void;
  setSubmitting: (v: boolean) => void;
}

export function usePayNowConfirm(params: ConfirmParams) {
  const {
    subscription, selectedAccountId, finalAmount, finalCurrency, paymentDate,
    onConfirm, onOpenChange, setSubmitting,
  } = params;
  const { toast } = useToast();

  return async function handleConfirm() {
    if (!subscription) return;
    if (!selectedAccountId) {
      toast({
        title: "Cuenta requerida",
        description: "Selecciona una cuenta para continuar.",
        variant: "destructive",
      });
      return;
    }
    if (!finalAmount || Number(finalAmount) <= 0) {
      toast({
        title: "Monto inválido",
        description: "Ingresa un monto válido.",
        variant: "destructive",
      });
      return;
    }
    try {
      setSubmitting(true);
      await onConfirm({
        accountId: Number(selectedAccountId),
        amount: Number(finalAmount),
        currency: finalCurrency,
        date: paymentDate,
      });
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "No se pudo adelantar el pago",
        description: err instanceof Error ? err.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
}
