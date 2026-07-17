import { useEffect, useState } from "react";
import type { RecurringTransaction } from "@/lib/types";

export function usePayNowFormState(open: boolean, subscription: RecurringTransaction | null) {
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [editableReference, setEditableReference] = useState("");
  const [finalAmount, setFinalAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loadingRate, setLoadingRate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Reset when modal opens with a new subscription
  useEffect(() => {
    if (open && subscription) {
      setSelectedAccountId("");
      setEditableReference(String(subscription.amount ?? 0));
      setFinalAmount("");
      setPaymentDate(new Date().toISOString().slice(0, 10));
    }
  }, [open, subscription]);

  return {
    selectedAccountId, setSelectedAccountId,
    editableReference, setEditableReference,
    finalAmount, setFinalAmount,
    paymentDate, setPaymentDate,
    loadingRate, setLoadingRate,
    submitting, setSubmitting,
  };
}
