import { Progress } from "@/components/ui/progress";
import type { Debt } from "@/lib/types";
import { StatusBadge } from "@/components/debt-card/StatusBadge";
import { formatCurrency } from "@/components/debt-card/formatCurrency";

interface DebtCardInfoProps {
  debt: Debt;
  progress: number;
}

export function DebtCardInfo({ debt, progress }: DebtCardInfoProps) {
  return (
    <>
      {/* Header: contact + status */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-foreground">
            {debt.contactName}
          </p>
          {debt.description && (
            <p className="truncate text-sm text-muted-foreground">
              {debt.description}
            </p>
          )}
        </div>
        <StatusBadge status={debt.status} />
      </div>

      {/* Amount info */}
      <div className="space-y-1">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-muted-foreground">
            Faltan {formatCurrency(debt.remaining, debt.currency)} de{" "}
            {formatCurrency(debt.totalAmount, debt.currency)}
          </span>
          <span className="text-xs text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Due date */}
      {debt.dueDate && (
        <p className="text-xs text-muted-foreground">
          Vence: {debt.dueDate}
        </p>
      )}
    </>
  );
}
