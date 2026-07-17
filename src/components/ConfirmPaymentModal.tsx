import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PaymentSummaryCard } from "./confirm-payment-modal/PaymentSummaryCard";
import { AccountSelectField } from "./confirm-payment-modal/AccountSelectField";
import { AmountCurrencyFields } from "./confirm-payment-modal/AmountCurrencyFields";
import { PaymentDateField } from "./confirm-payment-modal/PaymentDateField";
import { ConfirmPaymentFooter } from "./confirm-payment-modal/ConfirmPaymentFooter";
import { useConfirmPaymentForm } from "./confirm-payment-modal/useConfirmPaymentForm";
import { useConfirmPaymentSubmit } from "./confirm-payment-modal/useConfirmPaymentSubmit";
import type { ConfirmPaymentModalProps } from "./confirm-payment-modal/types";

export { formatAmountWithCurrency, calculateConvertedAmount } from "./confirm-payment-modal/types";

export function ConfirmPaymentModal({
  open, onOpenChange, pendingTx, referenceCurrency, referenceAmount, accounts, onConfirmed,
}: ConfirmPaymentModalProps) {
  const {
    selectedAccountId, setSelectedAccountId, finalAmount, setFinalAmount,
    paymentDate, setPaymentDate, loadingRate, selectedAccount, finalCurrency,
  } = useConfirmPaymentForm(open, pendingTx, referenceCurrency, referenceAmount, accounts);

  const { submitting, handleConfirm } = useConfirmPaymentSubmit({
    pendingTx, selectedAccountId, finalAmount, paymentDate, finalCurrency, onOpenChange, onConfirmed,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full max-w-md max-h-[85vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>Confirmar pago</DialogTitle>
          <DialogDescription>
            Registra el pago real con la cuenta, monto y fecha correctos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <PaymentSummaryCard pendingTx={pendingTx} referenceCurrency={referenceCurrency} referenceAmount={referenceAmount} />

          <AccountSelectField
            accounts={accounts}
            selectedAccountId={selectedAccountId}
            setSelectedAccountId={setSelectedAccountId}
          />

          <AmountCurrencyFields
            finalAmount={finalAmount}
            setFinalAmount={setFinalAmount}
            loadingRate={loadingRate}
            finalCurrency={finalCurrency}
            referenceCurrency={referenceCurrency}
            hasSelectedAccount={Boolean(selectedAccount)}
          />

          <PaymentDateField paymentDate={paymentDate} setPaymentDate={setPaymentDate} />
        </div>

        <ConfirmPaymentFooter
          onCancel={() => onOpenChange(false)}
          onConfirm={handleConfirm}
          disabled={!selectedAccountId || !finalAmount || submitting}
          submitting={submitting}
        />
      </DialogContent>
    </Dialog>
  );
}
