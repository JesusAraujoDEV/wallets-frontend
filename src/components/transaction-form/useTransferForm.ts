import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { TransfersStore } from "@/lib/storage";
import type { Account } from "@/lib/types";
import { useBcvTransferRate } from "./useBcvTransferRate";
import { useTransferArbitrage } from "./useTransferArbitrage";
import { getTransferValidationError } from "./validateTransfer";

export function useTransferForm({ accounts, onSubmitted }: { accounts: Account[]; onSubmitted?: () => void }) {
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [commission, setCommission] = useState("");
  const [transferDate, setTransferDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [concept, setConcept] = useState("");
  const [submittingTransfer, setSubmittingTransfer] = useState(false);

  const fromAccountData = accounts.find((a) => a.id === fromAccount);
  const toAccountData = accounts.find((a) => a.id === toAccount);
  const hasDifferentCurrencies = !!fromAccountData && !!toAccountData && fromAccountData.currency !== toAccountData.currency;
  const isUsdVesPair = !!fromAccountData && !!toAccountData && (
    (fromAccountData.currency === "USD" && toAccountData.currency === "VES") ||
    (fromAccountData.currency === "VES" && toAccountData.currency === "USD")
  );

  const bcv = useBcvTransferRate({ hasDifferentCurrencies, isUsdVesPair, transferDate });
  const arb = useTransferArbitrage({
    hasDifferentCurrencies, isUsdVesPair, transferAmount, fromAccountData, toAccountData,
    bcvOfficialRate: bcv.bcvOfficialRate, fromAccount, toAccount, transferDate,
  });

  const resetForm = () => {
    setFromAccount(""); setToAccount(""); setTransferAmount("");
    arb.setDestinationAmount(""); arb.setDestinationEdited(false);
    setCommission(""); setTransferDate(new Date().toISOString().slice(0, 10)); setConcept("");
    bcv.setBcvSourceDate(null);
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = getTransferValidationError({
      fromAccount, toAccount, transferAmount, fromAccountData, toAccountData,
      isUsdVesPair, hasDifferentCurrencies, destinationAmount: arb.destinationAmount,
    });
    if (error) {
      toast({ title: "Invalid transfer", description: error, variant: "destructive" });
      return;
    }
    if (!fromAccountData || !toAccountData) return;

    const destinationAmount = hasDifferentCurrencies ? Number(arb.destinationAmount) : Number(transferAmount);
    try {
      setSubmittingTransfer(true);
      await TransfersStore.create({
        fromAccountId: fromAccount, toAccountId: toAccount, amount: Number(transferAmount),
        destinationAmount,
        commission: commission ? parseFloat(commission) : undefined,
        date: transferDate || new Date().toISOString().slice(0, 10),
        concept: concept || undefined,
      });
      const symbol = fromAccountData.currency === "USD" ? "$" : fromAccountData.currency === "EUR" ? "€" : "";
      toast({ title: "Transfer created", description: `Moved ${symbol}${transferAmount} from ${fromAccountData.name} to ${toAccountData.name}.` });
      resetForm();
      onSubmitted?.();
    } finally {
      setSubmittingTransfer(false);
    }
  };

  return {
    fromAccount, setFromAccount, toAccount, setToAccount, transferAmount, setTransferAmount,
    commission, setCommission, transferDate, setTransferDate, concept, setConcept, submittingTransfer,
    fromAccountData, toAccountData, hasDifferentCurrencies, isUsdVesPair,
    handleTransferSubmit, ...bcv, ...arb,
  };
}
