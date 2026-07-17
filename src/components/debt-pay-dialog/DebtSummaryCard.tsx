import { Progress } from "@/components/ui/progress";
import type { Debt } from "@/lib/types";
import { formatCurrency } from "./types";

export function DebtSummaryCard({ debt, progress }: { debt: Debt; progress: number }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
      <p className="text-sm font-medium text-foreground">{debt.contactName}</p>
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-muted-foreground">
          Restante: {formatCurrency(debt.remaining, debt.currency)} de{" "}
          {formatCurrency(debt.totalAmount, debt.currency)}
        </span>
        <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
