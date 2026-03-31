import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { fetchLinkableTransactions, linkTransactions } from "@/lib/debts";
import type { Debt, Transaction } from "@/lib/types";

function fmtCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("es", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

interface LinkTransactionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debt: Debt | null;
  onLinked: (count: number) => void;
}

export function LinkTransactionsDialog({
  open,
  onOpenChange,
  debt,
  onLinked,
}: LinkTransactionsDialogProps) {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  // Track the original linked IDs to detect changes
  const [initialLinked, setInitialLinked] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open && debt?.categoryId) {
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
    }
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

  const selectedCount = selected.size;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>Vincular pagos a deuda</DialogTitle>
          <DialogDescription>
            Marca o desmarca transacciones para vincularlas o desvincularlas de{" "}
            <span className="font-medium text-foreground">{debt?.contactName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando transacciones...
            </div>
          ) : transactions.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No hay transacciones disponibles en esta categoría.
            </p>
          ) : (
            transactions.map((tx) => {
              const isLinked = initialLinked.has(tx.id);
              const isChecked = selected.has(tx.id);
              const txCurrency = tx.currency || debt?.currency || "USD";
              const showUsdEquiv = txCurrency !== "USD" && tx.amountUsd != null;

              return (
                <label
                  key={tx.id}
                  className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-accent/40 transition-colors"
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleSelection(tx.id)}
                    className="mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate flex-1">
                        {tx.description || "Sin descripción"}
                      </p>
                      {isLinked && (
                        <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5 py-0">
                          Vinculada
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {tx.date}
                    </p>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-sm font-semibold text-foreground">
                        {fmtCurrency(tx.amount, txCurrency)}
                      </span>
                      {showUsdEquiv && (
                        <span className="text-xs text-muted-foreground">
                          ≈ {fmtCurrency(tx.amountUsd!, "USD")}
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              );
            })
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-3">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={!hasChanges || submitting}
            onClick={handleSave}
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar ({selectedCount})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
