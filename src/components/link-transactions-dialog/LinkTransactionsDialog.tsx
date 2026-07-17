import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TransactionsList } from "./TransactionsList";
import { useLinkableTransactions } from "./useLinkableTransactions";
import { useLinkTransactionsSave } from "./useLinkTransactionsSave";
import type { LinkTransactionsDialogProps } from "./types";

export function LinkTransactionsDialog({ open, onOpenChange, debt, onLinked }: LinkTransactionsDialogProps) {
  const { transactions, loading, selected, initialLinked, toggleSelection, hasChanges } =
    useLinkableTransactions(open, debt);
  const { submitting, handleSave } = useLinkTransactionsSave(debt, selected, onLinked, onOpenChange);

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
          <TransactionsList
            loading={loading}
            transactions={transactions}
            debt={debt}
            initialLinked={initialLinked}
            selected={selected}
            onToggle={toggleSelection}
          />
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
