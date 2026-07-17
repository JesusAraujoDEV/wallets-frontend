import { Card, CardContent } from "@/components/ui/card";
import { DebtCardInfo } from "@/components/debt-card/DebtCardInfo";
import { DebtCardActions } from "@/components/debt-card/DebtCardActions";
import { computeDebtProgress } from "@/components/debt-card/computeDebtProgress";
import type { DebtCardProps } from "@/components/debt-card/types";

export function DebtCard({ debt, onPay, onEdit, onDelete, onLinkPast }: DebtCardProps) {
  const { progress, isPaid } = computeDebtProgress(debt);

  return (
    <Card className="border-border bg-card">
      <CardContent className="space-y-3 p-4">
        <DebtCardInfo debt={debt} progress={progress} />
        <DebtCardActions
          debt={debt}
          isPaid={isPaid}
          onPay={onPay}
          onEdit={onEdit}
          onDelete={onDelete}
          onLinkPast={onLinkPast}
        />
      </CardContent>
    </Card>
  );
}
