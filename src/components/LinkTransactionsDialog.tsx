import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
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
import { fetchUnlinkedTransactions, linkTransactions } from "@/lib/debts";
import type { Debt, Transaction } from "@/lib/types";

function formatCurrency(amount: number, currency: string) {
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

  useEffect(() => {
    if (open && debt?.categoryId) {
      setSelected(new Set());
      setLoading(true);
      fetchUnlinkedTransactions(debt.categoryId)
        .then(setTransactions)
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

  async function handleLink() {
    if (!debt || selected.size === 0) return;
    try {
      setSubmitting(true);
      const ids = Array.from(selected).map(Number);
      const res = await linkTransactions(debt.id, { transactionIds: ids });
      const count = res.linked ?? ids.length;
      onLinked(count);
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "No se pudieron vincular",
        description: err instanceof Error ? err.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>Vincular pagos anteriores</DialogTitle>
          <DialogDescription>
            Selecciona las transacciones de la categoría de esta deuda que deseas vincular a{" "}
            <span className="font-medium text-foreground">{debt?.contactName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando transacciones...
            </div>
          ) : transactions.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No hay transacciones sin vincular en esta categoría.
            </p>
          ) : (
            transactions.map((tx) => (
              <label
                key={tx.id}
                className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-accent/40 transition-colors"
              >
                <Checkbox
                  checked={selected.has(tx.id)}
                  onCheckedChange={() => toggleSelection(tx.id)}
                  className="mt-0.5"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {tx.description || "Sin descripción"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tx.date} · {formatCurrency(tx.amount, tx.currency || debt?.currency || "USD")}
                  </p>
                </div>
              </label>
            ))
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
            disabled={selected.size === 0 || submitting}
            onClick={handleLink}
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Vincular ({selected.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
