import { useEffect, useRef } from "react";
import type { Account, Debt } from "@/lib/types";
import { resolveAutoExchangeRate } from "./resolveAutoExchangeRate";

interface AutoExchangeRateParams {
  open: boolean;
  debt: Debt | null;
  selectedAccount: Account | undefined;
  requiresConversion: boolean;
  paymentDate: string;
  amount: string;
  manualEquivalentOverride: boolean;
  setEquivalentAmount: (v: string) => void;
  setOfficialRate: (v: number | null) => void;
  setManualEquivalentOverride: (v: boolean) => void;
  setAutoRateLoading: (v: boolean) => void;
  setAutoRateError: (v: string | null) => void;
  setAutoRateSourceDate: (v: string | null) => void;
}

export function useAutoExchangeRateEffect(params: AutoExchangeRateParams) {
  const {
    open, debt, selectedAccount, requiresConversion, paymentDate, manualEquivalentOverride,
    setEquivalentAmount, setOfficialRate, setManualEquivalentOverride,
    setAutoRateLoading, setAutoRateError, setAutoRateSourceDate,
  } = params;
  const amountRef = useRef(params.amount);
  const manualOverrideRef = useRef(manualEquivalentOverride);

  useEffect(() => { amountRef.current = params.amount; }, [params.amount]);
  useEffect(() => { manualOverrideRef.current = manualEquivalentOverride; }, [manualEquivalentOverride]);

  useEffect(() => {
    let cancelled = false;
    if (!requiresConversion) return;

    async function loadAutomaticRate() {
      if (!open || !debt || !selectedAccount || !paymentDate) return;
      setAutoRateLoading(true);
      setAutoRateError(null);
      setOfficialRate(null);
      if (!manualOverrideRef.current) setEquivalentAmount("");

      const result = await resolveAutoExchangeRate(debt.currency, selectedAccount.currency, paymentDate);
      if (cancelled) return;

      if ("error" in result) {
        setAutoRateError(result.error);
        setOfficialRate(null);
        setAutoRateSourceDate(null);
        setAutoRateLoading(false);
        return;
      }

      setOfficialRate(result.rate);
      setManualEquivalentOverride(false);
      if (!manualOverrideRef.current) {
        const currentAmount = Number(amountRef.current);
        setEquivalentAmount(
          Number.isFinite(currentAmount) && currentAmount > 0 ? (currentAmount * result.rate).toFixed(2) : "",
        );
      }
      setAutoRateSourceDate(result.sourceDate);
      setAutoRateLoading(false);
    }

    void loadAutomaticRate();
    return () => {
      cancelled = true;
    };
  }, [open, debt, selectedAccount, requiresConversion, paymentDate]);
}
