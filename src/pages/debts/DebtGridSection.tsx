import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DebtCard } from "@/components/DebtCard";
import type { Debt } from "@/lib/types";

export function DebtGridSection({
  debts,
  isLoading,
  onPay,
  onEdit,
  onDelete,
  onLinkPast,
}: {
  debts: Debt[];
  isLoading: boolean;
  onPay: (debt: Debt) => void;
  onEdit: (debt: Debt) => void;
  onDelete: (debt: Debt) => void;
  onLinkPast: (debt: Debt) => void;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando deudas...
      </div>
    );
  }

  if (debts.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Sin deudas registradas</AlertTitle>
        <AlertDescription>
          Crea una nueva deuda para empezar a llevar el control.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {debts.map((debt) => (
        <DebtCard
          key={debt.id}
          debt={debt}
          onPay={onPay}
          onEdit={onEdit}
          onDelete={onDelete}
          onLinkPast={onLinkPast}
        />
      ))}
    </div>
  );
}
