import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { fetchLinkableTransactions } from "@/lib/debts";
import type { Debt, Transaction } from "@/lib/types";

export function useLinkableTransactions(open: boolean, debt: Debt | null) {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  // Track the original linked IDs to detect changes
  const [initialLinked, setInitialLinked] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open || !debt?.categoryId) return;

    setSelected(new Set());
    setInitialLinked(new Set());
    setLoading(true);

    fetchLinkableTransactions(debt.categoryId, debt.id)
      .then((txs) => {
        setTransactions(txs);
        // Pre-select transactions already linked to this debt
        // Use String() coercion on both sides — backend may return debtId as number
        const debtIdStr = String(debt.id);
        const linked = new Set<string>();
        for (const tx of txs) {
          if (tx.debtId != null && String(tx.debtId) === debtIdStr) {
            linked.add(tx.id);
          }
        }
        if (import.meta.env.DEV) {
          console.log("[LinkTransactionsDialog] txs:", txs.length, "pre-linked:", linked.size, "debtId:", debtIdStr);
        }
        setSelected(new Set(linked));
        setInitialLinked(new Set(linked));
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "No se pudieron cargar las transacciones.",
          variant: "destructive",
        });
        setTransactions([]);
      })
      .finally(() => setLoading(false));
  }, [open, debt, toast]);

  function toggleSelection(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Detect if anything changed vs initial state
  const hasChanges = useMemo(() => {
    if (selected.size !== initialLinked.size) return true;
    for (const id of selected) {
      if (!initialLinked.has(id)) return true;
    }
    return false;
  }, [selected, initialLinked]);

  return { transactions, loading, selected, initialLinked, toggleSelection, hasChanges };
}
