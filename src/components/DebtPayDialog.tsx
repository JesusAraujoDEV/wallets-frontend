import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DebtSummaryCard } from "./debt-pay-dialog/DebtSummaryCard";
import { DebtAmountField } from "./debt-pay-dialog/DebtAmountField";
import { DebtAccountSelector } from "./debt-pay-dialog/DebtAccountSelector";
import { DebtEquivalentAmountField } from "./debt-pay-dialog/DebtEquivalentAmountField";
import { DebtPaymentPreview } from "./debt-pay-dialog/DebtPaymentPreview";
import { DebtCategoryDateFields } from "./debt-pay-dialog/DebtCategoryDateFields";
import { DebtPayDialogFooter } from "./debt-pay-dialog/DebtPayDialogFooter";
import { useDebtPayFormFields } from "./debt-pay-dialog/useDebtPayFormFields";
import { useEquivalentAmountState } from "./debt-pay-dialog/useEquivalentAmountState";
import { useAutoExchangeRateEffect } from "./debt-pay-dialog/useAutoExchangeRateEffect";
import { resolveSelectedAccount } from "./debt-pay-dialog/resolveSelectedAccount";
import { computeDebtPaymentDerived } from "./debt-pay-dialog/computeDebtPaymentDerived";
import { useDebtPayConfirm } from "./debt-pay-dialog/useDebtPayConfirm";
import type { DebtPayDialogProps } from "./debt-pay-dialog/types";

export function DebtPayDialog({ open, onOpenChange, debt, accounts, categories, onConfirm }: DebtPayDialogProps) {
  const fields = useDebtPayFormFields(open, debt);
  const { amount, selectedAccountId, selectedCategoryId, paymentDate, submitting } = fields;

  const { selectedAccount, requiresConversion } = resolveSelectedAccount(accounts, selectedAccountId, debt);
  const rate = useEquivalentAmountState(open, debt, requiresConversion, amount);
  const derived = computeDebtPaymentDerived({
    debt, selectedAccount, requiresConversion, amount, equivalentAmount: rate.equivalentAmount,
  });

  useAutoExchangeRateEffect({
    open, debt, selectedAccount, requiresConversion, paymentDate, amount,
    manualEquivalentOverride: rate.manualEquivalentOverride,
    setEquivalentAmount: rate.setEquivalentAmount, setOfficialRate: rate.setOfficialRate,
    setManualEquivalentOverride: rate.setManualEquivalentOverride, setAutoRateLoading: rate.setAutoRateLoading,
    setAutoRateError: rate.setAutoRateError, setAutoRateSourceDate: rate.setAutoRateSourceDate,
  });

  const handleConfirm = useDebtPayConfirm({
    debt, selectedAccountId, amount, paymentDate, selectedCategoryId, requiresConversion,
    hasValidEquivalentAmount: derived.hasValidEquivalentAmount, numEquivalentAmount: derived.numEquivalentAmount,
    hasValidAmount: derived.hasValidAmount, onConfirm, onOpenChange, setSubmitting: fields.setSubmitting,
  });

  const isPayable = debt?.type === "payable";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full max-w-md max-h-[85vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>{isPayable ? "Abonar deuda" : "Registrar cobro"}</DialogTitle>
          <DialogDescription>
            {isPayable ? `Pago a ${debt?.contactName ?? ""}` : `Cobro de ${debt?.contactName ?? ""}`}
          </DialogDescription>
        </DialogHeader>

        {debt && (
          <div className="space-y-4">
            <DebtSummaryCard debt={debt} progress={derived.progress} />

            <DebtAmountField
              debt={debt} amount={amount} setAmount={fields.setAmount} requiresConversion={requiresConversion}
              officialRate={rate.officialRate} manualEquivalentOverride={rate.manualEquivalentOverride}
              setEquivalentAmount={rate.setEquivalentAmount}
            />

            <DebtAccountSelector
              isPayable={isPayable} accounts={accounts} selectedAccountId={selectedAccountId}
              setSelectedAccountId={fields.setSelectedAccountId}
            />

            {requiresConversion && selectedAccount && (
              <DebtEquivalentAmountField
                selectedAccount={selectedAccount} equivalentAmount={rate.equivalentAmount}
                setEquivalentAmount={rate.setEquivalentAmount} setManualEquivalentOverride={rate.setManualEquivalentOverride}
                autoRateLoading={rate.autoRateLoading} officialRate={rate.officialRate}
                hasValidAmount={derived.hasValidAmount} hasValidEquivalentAmount={derived.hasValidEquivalentAmount}
                hasValidImplicitRate={derived.hasValidImplicitRate} implicitExchangeRate={derived.implicitExchangeRate}
                autoRateSourceDate={rate.autoRateSourceDate} autoRateError={rate.autoRateError}
              />
            )}

            <DebtPaymentPreview
              debt={debt} selectedAccount={selectedAccount} hasValidAmount={derived.hasValidAmount}
              requiresConversion={requiresConversion} hasValidEquivalentAmount={derived.hasValidEquivalentAmount}
              canRenderPreview={derived.canRenderPreview} numericAmount={derived.numericAmount}
              finalUsedAmount={derived.finalUsedAmount} finalUsedRate={derived.finalUsedRate}
            />

            <DebtCategoryDateFields
              categories={categories} selectedCategoryId={selectedCategoryId}
              setSelectedCategoryId={fields.setSelectedCategoryId} paymentDate={paymentDate}
              setPaymentDate={fields.setPaymentDate}
            />
          </div>
        )}

        <DebtPayDialogFooter
          onOpenChange={onOpenChange} selectedAccountId={selectedAccountId} amount={amount} submitting={submitting}
          requiresConversion={requiresConversion} hasValidEquivalentAmount={derived.hasValidEquivalentAmount}
          isPayable={isPayable} handleConfirm={handleConfirm}
        />
      </DialogContent>
    </Dialog>
  );
}
