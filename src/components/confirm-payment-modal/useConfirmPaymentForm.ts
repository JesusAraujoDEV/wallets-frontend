import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { getRateByDate } from "@/lib/rates";
import type { Account, Transaction } from "@/lib/types";
import { calculateConvertedAmount, type Currency } from "./types";

export function useConfirmPaymentForm(
  open: boolean,
  pendingTx: Transaction | null,
  referenceCurrency: Currency,
  referenceAmount: number,
  accounts: Account[],
) {
  const { toast } = useToast();
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [finalAmount, setFinalAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loadingRate, setLoadingRate] = useState(false);

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const finalCurrency: Currency = selectedAccount?.currency ?? referenceCurrency;

  // Reset state when modal opens with a new transaction
  useEffect(() => {
    if (open && pendingTx) {
      setSelectedAccountId("");
      setFinalAmount("");
      setPaymentDate(new Date().toISOString().slice(0, 10));
    }
  }, [open, pendingTx]);

  const doAutoCalc = useCallback(async (accountCurrency: Currency, date: string) => {
    if (accountCurrency === referenceCurrency) {
      setFinalAmount(referenceAmount.toFixed(2));
      return;
    }
    try {
      setLoadingRate(true);
      const snap = await getRateByDate(date);
      if (!snap) throw new Error("No se pudo obtener la tasa BCV.");
      const converted = calculateConvertedAmount(referenceAmount, referenceCurrency, accountCurrency, snap);
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
  }, [referenceCurrency, referenceAmount, toast]);

  // Auto-calc when account or date changes
  useEffect(() => {
    if (!selectedAccount || !open) return;
    doAutoCalc(selectedAccount.currency, paymentDate);
  }, [selectedAccountId, paymentDate, selectedAccount, open, doAutoCalc]);

  return {
    selectedAccountId, setSelectedAccountId,
    finalAmount, setFinalAmount,
    paymentDate, setPaymentDate,
    loadingRate, selectedAccount, finalCurrency,
  };
}
