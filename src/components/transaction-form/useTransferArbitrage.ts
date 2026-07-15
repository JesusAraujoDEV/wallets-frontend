import { useEffect, useState } from "react";
import type { Account } from "@/lib/types";

export function useTransferArbitrage({
  hasDifferentCurrencies, isUsdVesPair, transferAmount, fromAccountData, toAccountData, bcvOfficialRate,
  fromAccount, toAccount, transferDate,
}: {
  hasDifferentCurrencies: boolean;
  isUsdVesPair: boolean;
  transferAmount: string;
  fromAccountData: Account | undefined;
  toAccountData: Account | undefined;
  bcvOfficialRate: number | null;
  fromAccount: string;
  toAccount: string;
  transferDate: string;
}) {
  const [destinationAmount, setDestinationAmount] = useState("");
  const [destinationEdited, setDestinationEdited] = useState(false);

  useEffect(() => {
    setDestinationEdited(false);
  }, [fromAccount, toAccount, transferDate]);

  useEffect(() => {
    if (!hasDifferentCurrencies || !isUsdVesPair) {
      if (!destinationEdited) setDestinationAmount("");
      return;
    }
    const numericAmount = Number(transferAmount);
    if (!isFinite(numericAmount) || numericAmount <= 0 || !bcvOfficialRate || bcvOfficialRate <= 0) {
      if (!destinationEdited) setDestinationAmount("");
      return;
    }
    if (destinationEdited) return;

    const calculated = fromAccountData?.currency === "USD"
      ? numericAmount * bcvOfficialRate
      : numericAmount / bcvOfficialRate;
    setDestinationAmount(calculated.toFixed(2));
  }, [hasDifferentCurrencies, isUsdVesPair, transferAmount, destinationEdited, fromAccountData?.currency, bcvOfficialRate]);

  const parsedTransferAmount = Number(transferAmount);
  const parsedDestinationAmount = Number(destinationAmount);
  const showArbitrageSummary =
    hasDifferentCurrencies && isUsdVesPair &&
    fromAccountData?.currency === "USD" && toAccountData?.currency === "VES" &&
    isFinite(parsedTransferAmount) && parsedTransferAmount > 0 &&
    isFinite(parsedDestinationAmount) && parsedDestinationAmount > 0 &&
    !!bcvOfficialRate && bcvOfficialRate > 0;

  const baseBcvAmount = showArbitrageSummary ? parsedTransferAmount * (bcvOfficialRate ?? 0) : null;
  const appliedRate = showArbitrageSummary ? parsedDestinationAmount / parsedTransferAmount : null;
  const gainOrLoss = showArbitrageSummary && baseBcvAmount != null ? parsedDestinationAmount - baseBcvAmount : null;
  const gainOrLossUsdApprox = showArbitrageSummary && gainOrLoss != null && bcvOfficialRate ? gainOrLoss / bcvOfficialRate : null;

  return {
    destinationAmount, setDestinationAmount, destinationEdited, setDestinationEdited,
    showArbitrageSummary, baseBcvAmount, appliedRate, gainOrLoss, gainOrLossUsdApprox,
  };
}
