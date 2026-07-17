import type { Account, Debt } from "@/lib/types";

export function computeDebtPaymentDerived({
  debt, selectedAccount, requiresConversion, amount, equivalentAmount,
}: {
  debt: Debt | null;
  selectedAccount: Account | undefined;
  requiresConversion: boolean;
  amount: string;
  equivalentAmount: string;
}) {
  const progress =
    debt && debt.totalAmount > 0 ? Math.min((debt.paidAmount / debt.totalAmount) * 100, 100) : 0;
  const numEquivalentAmount = Number(equivalentAmount);
  const hasValidEquivalentAmount =
    !requiresConversion ||
    (Boolean(equivalentAmount) && Number.isFinite(numEquivalentAmount) && numEquivalentAmount > 0);

  const numericAmount = Number(amount);
  const hasValidAmount = Number.isFinite(numericAmount) && numericAmount > 0;
  const implicitExchangeRate =
    requiresConversion && hasValidAmount && Number.isFinite(numEquivalentAmount) && numEquivalentAmount > 0
      ? numEquivalentAmount / numericAmount
      : NaN;
  const hasValidImplicitRate =
    !requiresConversion || (Number.isFinite(implicitExchangeRate) && implicitExchangeRate > 0);
  const finalUsedAmount = requiresConversion ? numEquivalentAmount : numericAmount;
  const finalUsedRate = requiresConversion ? implicitExchangeRate : 1;
  const canRenderPreview =
    Boolean(debt && selectedAccount) && hasValidAmount && hasValidEquivalentAmount && hasValidImplicitRate;

  return {
    progress,
    numEquivalentAmount,
    hasValidEquivalentAmount,
    numericAmount,
    hasValidAmount,
    implicitExchangeRate,
    hasValidImplicitRate,
    finalUsedAmount,
    finalUsedRate,
    canRenderPreview,
  };
}
