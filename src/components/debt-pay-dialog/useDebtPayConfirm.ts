import { useToast } from "@/components/ui/use-toast";
import type { Debt } from "@/lib/types";
import { validateDebtPayment } from "./validateDebtPayment";

export function useDebtPayConfirm({
  debt, selectedAccountId, amount, paymentDate, selectedCategoryId, requiresConversion,
  hasValidEquivalentAmount, numEquivalentAmount, hasValidAmount, onConfirm, onOpenChange, setSubmitting,
}: {
  debt: Debt | null;
  selectedAccountId: string;
  amount: string;
  paymentDate: string;
  selectedCategoryId: string;
  requiresConversion: boolean;
  hasValidEquivalentAmount: boolean;
  numEquivalentAmount: number;
  hasValidAmount: boolean;
  onConfirm: (payload: {
    amount: number;
    currency: string;
    accountId: number;
    date: string;
    categoryId?: number;
    exchangeRate?: number;
  }) => Promise<void>;
  onOpenChange: (open: boolean) => void;
  setSubmitting: (v: boolean) => void;
}) {
  const { toast } = useToast();

  return async function handleConfirm() {
    if (!debt) return;

    const result = validateDebtPayment({
      debt, selectedAccountId, amount, paymentDate, requiresConversion,
      hasValidEquivalentAmount, hasValidAmount, numEquivalentAmount,
    });
    if ("title" in result) {
      toast({ title: result.title, description: result.description, variant: "destructive" });
      return;
    }

    try {
      setSubmitting(true);
      await onConfirm({
        amount: result.numAmount,
        currency: debt.currency,
        accountId: Number(selectedAccountId),
        date: paymentDate,
        categoryId: selectedCategoryId ? Number(selectedCategoryId) : undefined,
        ...(requiresConversion && result.calculatedRate ? { exchangeRate: result.calculatedRate } : {}),
      });
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "No se pudo registrar el abono",
        description: err instanceof Error ? err.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
}
