import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { linkTransactions } from "@/lib/debts";
import type { Debt } from "@/lib/types";

export function useLinkTransactionsSave(
  debt: Debt | null,
  selected: Set<string>,
  onLinked: (count: number) => void,
  onOpenChange: (open: boolean) => void,
) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  async function handleSave() {
    if (!debt) return;
    try {
      setSubmitting(true);
      const ids = Array.from(selected).map(Number);
      const res = await linkTransactions(debt.id, { transactionIds: ids });
      const count = res.linked ?? ids.length;
      onLinked(count);
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "No se pudieron guardar los cambios",
        description: err instanceof Error ? err.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return { submitting, handleSave };
}
