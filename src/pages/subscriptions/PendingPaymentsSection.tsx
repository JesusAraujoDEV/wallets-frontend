import { AlertCircle, CalendarClock, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAmountWithCurrency } from "@/components/ConfirmPaymentModal";
import type { Transaction } from "@/lib/types";

export function PendingPaymentsSection({ isLoading, pendingTransactions, onConfirm }: {
  isLoading: boolean; pendingTransactions: Transaction[]; onConfirm: (tx: Transaction) => void;
}) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Alertas de pago</CardTitle>
        <CardDescription>Los movimientos en manual quedan pending hasta que confirmes la fecha real de pago.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando pendientes...
          </div>
        ) : pendingTransactions.length > 0 ? (
          <>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Tienes {pendingTransactions.length} pago(s) pendiente(s)</AlertTitle>
              <AlertDescription>
                Confirma cada transacción para moverla de pending a completed y mantener tus métricas confiables.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {pendingTransactions.map((tx) => (
                <Card key={tx.id} className="border-destructive/30">
                  <CardContent className="space-y-3 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{tx.description || "Pago recurrente"}</p>
                        <p className="text-xs text-muted-foreground">Fecha programada: {tx.date}</p>
                      </div>
                      <Badge variant="destructive">Pendiente</Badge>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-semibold text-foreground">
                        {formatAmountWithCurrency(tx.amount, (tx.currency as "USD" | "EUR" | "VES") || "USD")}
                      </p>
                      <Button type="button" className="w-full sm:w-auto" onClick={() => onConfirm(tx)}>
                        Confirmar Pago
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <Alert>
            <CalendarClock className="h-4 w-4" />
            <AlertTitle>Sin pagos pendientes</AlertTitle>
            <AlertDescription>
              Los cobros auto-pago ya se marcan completed automáticamente y aquí solo verás los que requieren confirmación manual.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
