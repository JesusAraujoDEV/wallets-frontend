import { useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { calculateConvertedAmount } from "@/components/ConfirmPaymentModal";
import { getRateByDate } from "@/lib/rates";
import type { Account } from "@/lib/types";
import type { Currency } from "./types";

interface AutoCalcParams {
  open: boolean;
  referenceCurrency: Currency;
  editableReference: string;
  selectedAccount: Account | undefined;
  selectedAccountId: string;
  paymentDate: string;
  setFinalAmount: (v: string) => void;
  setLoadingRate: (v: boolean) => void;
}

export function useAutoCalcEffect(params: AutoCalcParams) {
  const {
    open, referenceCurrency, editableReference, selectedAccount, selectedAccountId,
    paymentDate, setFinalAmount, setLoadingRate,
  } = params;
  const { toast } = useToast();

  const doAutoCalc = useCallback(
    async (accountCurrency: Currency, date: string) => {
      const baseAmount = Number(editableReference) || 0;
      if (baseAmount <= 0) {
        setFinalAmount("");
        return;
      }
      if (accountCurrency === referenceCurrency) {
        setFinalAmount(baseAmount.toFixed(2));
        return;
      }
      try {
        setLoadingRate(true);
        const snap = await getRateByDate(date);
        if (!snap) throw new Error("No se pudo obtener la tasa BCV.");
        const converted = calculateConvertedAmount(baseAmount, referenceCurrency, accountCurrency, snap);
        if (converted !== null) setFinalAmount(converted.toFixed(2));
        else throw new Error("Conversión no soportada.");
      } catch (err) {
        toast({
          title: "Error al obtener tasa BCV",
          description: err instanceof Error ? err.message : "Ingresa el monto manualmente.",
          variant: "destructive",
        });
        setFinalAmount("");
      } finally {
        setLoadingRate(false);
      }
    },
    [referenceCurrency, editableReference, toast, setFinalAmount, setLoadingRate],
  );

  // Auto-calc when account, date, or editable reference changes
  useEffect(() => {
    if (!selectedAccount || !open) return;
    doAutoCalc(selectedAccount.currency, paymentDate);
  }, [selectedAccountId, paymentDate, selectedAccount, open, doAutoCalc]);
}
