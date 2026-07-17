import { useEffect, useState } from "react";
import type { Debt } from "@/lib/types";

export function useDebtPayFormFields(open: boolean, debt: Debt | null) {
  const [amount, setAmount] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !debt) return;
    setAmount(String(debt.remaining));
    setSelectedAccountId("");
    setSelectedCategoryId(debt.categoryId || "");
    setPaymentDate(new Date().toISOString().slice(0, 10));
  }, [open, debt]);

  return {
    amount, setAmount,
    selectedAccountId, setSelectedAccountId,
    selectedCategoryId, setSelectedCategoryId,
    paymentDate, setPaymentDate,
    submitting, setSubmitting,
  };
}
