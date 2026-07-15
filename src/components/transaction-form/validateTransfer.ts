import type { Account } from "@/lib/types";

export function getTransferValidationError({
  fromAccount, toAccount, transferAmount, fromAccountData, toAccountData,
  isUsdVesPair, hasDifferentCurrencies, destinationAmount,
}: {
  fromAccount: string;
  toAccount: string;
  transferAmount: string;
  fromAccountData: Account | undefined;
  toAccountData: Account | undefined;
  isUsdVesPair: boolean;
  hasDifferentCurrencies: boolean;
  destinationAmount: string;
}): string | null {
  if (!fromAccount || !toAccount || !transferAmount) return "Please choose both accounts and an amount.";
  if (fromAccount === toAccount) return "Origin and destination accounts must be different.";
  if (!fromAccountData || !toAccountData) return null;
  if (fromAccountData.currency !== toAccountData.currency && !isUsdVesPair) {
    return "This transfer currently supports only USD and VES between different currencies.";
  }
  if (hasDifferentCurrencies && !destinationAmount) {
    return "Please enter the amount received in the destination account.";
  }
  const parsedAmount = Number(transferAmount);
  const parsedDestinationAmount = hasDifferentCurrencies ? Number(destinationAmount) : Number(transferAmount);
  if (!isFinite(parsedAmount) || parsedAmount <= 0 || !isFinite(parsedDestinationAmount) || parsedDestinationAmount <= 0) {
    return "Amounts must be greater than zero.";
  }
  return null;
}
