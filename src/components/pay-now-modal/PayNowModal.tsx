import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PayNowSubscriptionCard } from "./PayNowSubscriptionCard";
import { PayNowAccountSelector } from "./PayNowAccountSelector";
import { PayNowAmountCurrencyFields } from "./PayNowAmountCurrencyFields";
import { PayNowDateField } from "./PayNowDateField";
import { PayNowModalFooter } from "./PayNowModalFooter";
import { usePayNowFormState } from "./usePayNowFormState";
import { useAutoCalcEffect } from "./useAutoCalcEffect";
import { usePayNowConfirm } from "./usePayNowConfirm";
import type { Currency, PayNowModalProps } from "./types";

export function PayNowModal({
  open,
  onOpenChange,
  subscription,
  accounts,
  onConfirm,
}: PayNowModalProps) {
  const form = usePayNowFormState(open, subscription);
  const {
    selectedAccountId, setSelectedAccountId, editableReference, setEditableReference,
    finalAmount, setFinalAmount, paymentDate, setPaymentDate, loadingRate, setLoadingRate, submitting,
  } = form;

  const referenceCurrency: Currency = subscription?.currency ?? "USD";
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const finalCurrency: Currency = selectedAccount?.currency ?? referenceCurrency;

  useAutoCalcEffect({
    open, referenceCurrency, editableReference, selectedAccount, selectedAccountId,
    paymentDate, setFinalAmount, setLoadingRate,
  });

  const handleConfirm = usePayNowConfirm({
    subscription, selectedAccountId, finalAmount, finalCurrency, paymentDate,
    onConfirm, onOpenChange, setSubmitting: form.setSubmitting,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full max-w-md max-h-[85vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>Adelantar pago</DialogTitle>
          <DialogDescription>
            Registra el pago anticipado con la cuenta, monto y fecha correctos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <PayNowSubscriptionCard
            subscription={subscription} referenceCurrency={referenceCurrency}
            editableReference={editableReference} setEditableReference={setEditableReference}
          />

          <PayNowAccountSelector
            accounts={accounts} selectedAccountId={selectedAccountId}
            setSelectedAccountId={setSelectedAccountId}
          />

          <PayNowAmountCurrencyFields
            finalAmount={finalAmount} setFinalAmount={setFinalAmount} loadingRate={loadingRate}
            finalCurrency={finalCurrency} referenceCurrency={referenceCurrency} selectedAccount={selectedAccount}
          />

          <PayNowDateField paymentDate={paymentDate} setPaymentDate={setPaymentDate} />
        </div>

        <PayNowModalFooter
          onOpenChange={onOpenChange} selectedAccountId={selectedAccountId} finalAmount={finalAmount}
          submitting={submitting} handleConfirm={handleConfirm}
        />
      </DialogContent>
    </Dialog>
  );
}
