import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { confirmPendingTransaction } from "@/lib/subscriptions";
import { getRateByDate, type ExchangeSnapshot } from "@/lib/rates";
import type { Account, Transaction } from "@/lib/types";

type Currency = "USD" | "EUR" | "VES";

export function formatAmountWithCurrency(amount: number, currency: Currency): string {
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "Bs.";
  return `${symbol}${Math.abs(amount || 0).toFixed(2)} ${currency}`;
}

export function calculateConvertedAmount(
  referenceAmount: number,
  referenceCurrency: Currency,
  accountCurrency: Currency,
  snapshot: ExchangeSnapshot,
): number | null {
  if (referenceCurrency === accountCurrency) return referenceAmount;
  if (accountCurrency === "VES") {
    if (referenceCurrency === "USD") return snapshot.vesPerUsd * referenceAmount;
    if (referenceCurrency === "EUR") return snapshot.vesPerEur * referenceAmount;
  }
  if (referenceCurrency === "VES") {
    if (accountCurrency === "USD" && snapshot.vesPerUsd) return referenceAmount / snapshot.vesPerUsd;
    if (accountCurrency === "EUR" && snapshot.vesPerEur) return referenceAmount / snapshot.vesPerEur;
  }
  // Cross: EUR→USD or USD→EUR via VES rates
  if (referenceCurrency === "EUR" && accountCurrency === "USD" && snapshot.vesPerEur && snapshot.vesPerUsd) {
    return (snapshot.vesPerEur / snapshot.vesPerUsd) * referenceAmount;
  }
  if (referenceCurrency === "USD" && accountCurrency === "EUR" && snapshot.vesPerUsd && snapshot.vesPerEur) {
    return (snapshot.vesPerUsd / snapshot.vesPerEur) * referenceAmount;
  }
  return null;
}

interface ConfirmPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingTx: Transaction | null;
  referenceCurrency: Currency;
  referenceAmount: number;
  accounts: Account[];
  onConfirmed: () => void;
}

export function ConfirmPaymentModal({
  open, onOpenChange, pendingTx, referenceCurrency, referenceAmount, accounts, onConfirmed,
}: ConfirmPaymentModalProps) {
  const { toast } = useToast();
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [finalAmount, setFinalAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loadingRate, setLoadingRate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const finalCurrency: Currency = selectedAccount?.currency ?? referenceCurrency;

  // Reset state when modal opens with a new transaction
  useEffect(() => {
    if (open && pendingTx) {
      setSelectedAccountId("");
      setFinalAmount("");
      setPaymentDate(new Date().toISOString().slice(0, 10));
    }
  }, [open, pendingTx]);

  const doAutoCalc = useCallback(async (accountCurrency: Currency, date: string) => {
    if (accountCurrency === referenceCurrency) {
      setFinalAmount(referenceAmount.toFixed(2));
      return;
    }
    try {
      setLoadingRate(true);
      const snap = await getRateByDate(date);
      if (!snap) throw new Error("No se pudo obtener la tasa BCV.");
      const converted = calculateConvertedAmount(referenceAmount, referenceCurrency, accountCurrency, snap);
      if (converted !== null) setFinalAmount(converted.toFixed(2));
      else throw new Error("Conversión no soportada.");
    } catch (err) {
      toast({
        title: "Error al obtener tasa BCV",
        description: err instanceof Error ? err.message : "Ingresa el monto manualmente.",
        variant: "destructive",
      });
      setFinalAmount("");
    } finally {
      setLoadingRate(false);
    }
  }, [referenceCurrency, referenceAmount, toast]);

  // Auto-calc when account or date changes
  useEffect(() => {
    if (!selectedAccount || !open) return;
    doAutoCalc(selectedAccount.currency, paymentDate);
  }, [selectedAccountId, paymentDate, selectedAccount, open, doAutoCalc]);

  const handleConfirm = async () => {
    if (!pendingTx) return;
    if (!selectedAccountId) {
      toast({ title: "Cuenta requerida", description: "Selecciona una cuenta para continuar.", variant: "destructive" });
      return;
    }
    if (!finalAmount || Number(finalAmount) <= 0) {
      toast({ title: "Monto inválido", description: "Ingresa un monto válido.", variant: "destructive" });
      return;
    }
    try {
      setSubmitting(true);
      await confirmPendingTransaction(pendingTx.id, {
        date: paymentDate,
        accountId: Number(selectedAccountId),
        amount: Number(finalAmount),
        currency: finalCurrency,
      });
      toast({ title: "Pago confirmado", description: "La transacción se registró correctamente." });
      onOpenChange(false);
      onConfirmed();
    } catch (err) {
      toast({
        title: "No se pudo confirmar el pago",
        description: err instanceof Error ? err.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full max-w-md max-h-[85vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>Confirmar pago</DialogTitle>
          <DialogDescription>
            Registra el pago real con la cuenta, monto y fecha correctos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
            <p className="text-sm font-medium text-foreground">{pendingTx?.description || "Pago recurrente"}</p>
            <p className="text-xs text-muted-foreground">Fecha programada: {pendingTx?.date}</p>
            <p className="text-sm font-semibold text-foreground">
              Referencia: {formatAmountWithCurrency(referenceAmount, referenceCurrency)}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Cuenta de pago</Label>
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cuenta" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name} ({acc.currency})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!selectedAccountId && (
              <p className="text-xs text-muted-foreground">Selecciona una cuenta para continuar.</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="confirm-final-amount">Monto final</Label>
              <div className="relative">
                <Input
                  id="confirm-final-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={finalAmount}
                  onChange={(e) => setFinalAmount(e.target.value)}
                  disabled={loadingRate}
                />
                {loadingRate && (
                  <div className="absolute inset-y-0 right-3 flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
              {selectedAccount && finalCurrency !== referenceCurrency && (
                <p className="text-xs text-muted-foreground">
                  Convertido a {finalCurrency} vía tasa BCV
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Moneda final</Label>
              <Input value={finalCurrency} disabled className="bg-muted" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-payment-date">Fecha real de pago</Label>
            <Input
              id="confirm-payment-date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-3">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={!selectedAccountId || !finalAmount || submitting}
            onClick={handleConfirm}
          >
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Confirmar Pago
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
