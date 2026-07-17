import { useEffect, useState } from "react";
import type { Debt } from "@/lib/types";

export function useEquivalentAmountState(
  open: boolean,
  debt: Debt | null,
  requiresConversion: boolean,
  amount: string,
) {
  const [equivalentAmount, setEquivalentAmount] = useState("");
  const [officialRate, setOfficialRate] = useState<number | null>(null);
  const [manualEquivalentOverride, setManualEquivalentOverride] = useState(false);
  const [autoRateLoading, setAutoRateLoading] = useState(false);
  const [autoRateError, setAutoRateError] = useState<string | null>(null);
  const [autoRateSourceDate, setAutoRateSourceDate] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !debt) return;
    setEquivalentAmount("");
    setOfficialRate(null);
    setManualEquivalentOverride(false);
    setAutoRateLoading(false);
    setAutoRateError(null);
    setAutoRateSourceDate(null);
  }, [open, debt]);

  useEffect(() => {
    if (requiresConversion) return;
    setAutoRateLoading(false);
    setAutoRateError(null);
    setAutoRateSourceDate(null);
    setOfficialRate(null);
    setEquivalentAmount("");
    setManualEquivalentOverride(false);
  }, [requiresConversion]);

  useEffect(() => {
    if (!requiresConversion || !officialRate || manualEquivalentOverride) return;
    const currentAmount = Number(amount);
    setEquivalentAmount(
      Number.isFinite(currentAmount) && currentAmount > 0 ? (currentAmount * officialRate).toFixed(2) : "",
    );
  }, [amount, requiresConversion, officialRate, manualEquivalentOverride]);

  return {
    equivalentAmount, setEquivalentAmount,
    officialRate, setOfficialRate,
    manualEquivalentOverride, setManualEquivalentOverride,
    autoRateLoading, setAutoRateLoading,
    autoRateError, setAutoRateError,
    autoRateSourceDate, setAutoRateSourceDate,
  };
}
