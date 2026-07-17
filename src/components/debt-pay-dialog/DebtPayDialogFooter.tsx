import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

export function DebtPayDialogFooter({
  onOpenChange, selectedAccountId, amount, submitting, requiresConversion, hasValidEquivalentAmount,
  isPayable, handleConfirm,
}: {
  onOpenChange: (open: boolean) => void;
  selectedAccountId: string;
  amount: string;
  submitting: boolean;
  requiresConversion: boolean;
  hasValidEquivalentAmount: boolean;
  isPayable: boolean;
  handleConfirm: () => void;
}) {
  return (
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
        disabled={!selectedAccountId || !amount || submitting || (requiresConversion && !hasValidEquivalentAmount)}
        onClick={handleConfirm}
      >
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPayable ? "Registrar Pago" : "Registrar Cobro"}
      </Button>
    </DialogFooter>
  );
}
