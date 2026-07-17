import { CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAmountWithCurrency } from "@/components/ConfirmPaymentModal";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/lib/types";

export function PendingApprovalsSection({
  pendingTransactions,
  onConfirm,
}: {
  pendingTransactions: Transaction[];
  onConfirm: (tx: Transaction) => void;
}) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Aprobaciones Pendientes</CardTitle>
        <CardDescription>{pendingTransactions.length} pagos por confirmar</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay pagos pendientes por aprobar.</p>
          ) : (
            pendingTransactions.map((tx) => (
              <div key={tx.id} className="rounded-lg border border-destructive/30 bg-card p-3 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{tx.description || "Pago pendiente"}</p>
                    <p className="text-xs text-muted-foreground">Fecha: {tx.date}</p>
                  </div>
                  <Badge variant="destructive">Pending</Badge>
                </div>
                <p className={cn("text-sm font-semibold", tx.type === "expense" ? "text-red-600" : "text-emerald-600")}>
                  {formatAmountWithCurrency(tx.amount, tx.currency ?? "USD")}
                </p>
                <Button className="w-full h-11 text-base" onClick={() => onConfirm(tx)}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Confirmar Pago Ahora
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
