import { useTranslation } from "react-i18next";
import type { Account, Debt } from "@/lib/types";

export function DebtPaymentPreview({
  debt, selectedAccount, hasValidAmount, requiresConversion, hasValidEquivalentAmount, canRenderPreview,
  numericAmount, finalUsedAmount, finalUsedRate,
}: {
  debt: Debt;
  selectedAccount: Account | undefined;
  hasValidAmount: boolean;
  requiresConversion: boolean;
  hasValidEquivalentAmount: boolean;
  canRenderPreview: boolean;
  numericAmount: number;
  finalUsedAmount: number;
  finalUsedRate: number;
}) {
  const { t } = useTranslation();
  return (
    <div className="rounded-md border border-border bg-muted/30 p-3">
      {!selectedAccount && (
        <p className="text-xs text-muted-foreground">
          {t("debts.selectAccountToPreview")}
        </p>
      )}
      {selectedAccount && !hasValidAmount && (
        <p className="text-xs text-muted-foreground">
          {t("debts.enterValidAmountToPreview")}
        </p>
      )}
      {selectedAccount && hasValidAmount && requiresConversion && !hasValidEquivalentAmount && (
        <p className="text-xs text-muted-foreground">
          {t("debts.enterValidDebitAmountToPreview")}
        </p>
      )}
      {canRenderPreview && selectedAccount && (
        <p className="text-sm text-foreground">
          {t("debts.paymentPreviewSummary", {
            amount: numericAmount.toFixed(2),
            currency: debt.currency,
            finalAmount: finalUsedAmount.toFixed(2),
            finalCurrency: selectedAccount.currency,
            rate: finalUsedRate.toFixed(6),
          })}
        </p>
      )}
    </div>
  );
}
