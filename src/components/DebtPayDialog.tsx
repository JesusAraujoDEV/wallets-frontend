import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { CategorySelector } from "@/components/CategorySelector";
import type { Account, Category, Debt } from "@/lib/types";

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("es", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

interface DebtPayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debt: Debt | null;
  accounts: Account[];
  categories: Category[];
  onConfirm: (payload: {
    amount: number;
    currency: string;
    accountId: number;
    date: string;
    categoryId?: number;
    exchangeRate?: number;
  }) => Promise<void>;
}

export function DebtPayDialog({
  open,
  onOpenChange,
  debt,
  accounts,
  categories,
  onConfirm,
}: DebtPayDialogProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [exchangeRate, setExchangeRate] = useState("");
  const [paymentDate, setPaymentDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && debt) {
      setAmount(String(debt.remaining));
      setSelectedAccountId("");
      setSelectedCategoryId(debt.categoryId || "");
      setExchangeRate("");
      setPaymentDate(new Date().toISOString().slice(0, 10));
    }
  }, [open, debt]);

  const progress =
    debt && debt.totalAmount > 0
      ? Math.min((debt.paidAmount / debt.totalAmount) * 100, 100)
      : 0;
  const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId);
  const requiresConversion = Boolean(
    debt && selectedAccount && selectedAccount.currency !== debt.currency,
  );
  const numExchangeRate = Number(exchangeRate);
  const hasValidExchangeRate =
    !requiresConversion ||
    (Boolean(exchangeRate) && Number.isFinite(numExchangeRate) && numExchangeRate > 0);
  const convertedAmountPreview =
    Number(amount) > 0 && hasValidExchangeRate && requiresConversion
      ? Number(amount) * numExchangeRate
      : 0;

  const handleConfirm = async () => {
    if (!debt) return;
    if (!selectedAccountId) {
      toast({
        title: "Cuenta requerida",
        description: "Selecciona una cuenta para continuar.",
        variant: "destructive",
      });
      return;
    }
    const numAmount = Number(amount);
    if (!amount || numAmount <= 0) {
      toast({
        title: "Monto inválido",
        description: "Ingresa un monto válido.",
        variant: "destructive",
      });
      return;
    }
    if (numAmount > debt.remaining) {
      toast({
        title: "Monto excede el saldo",
        description: `El máximo a abonar es ${formatCurrency(debt.remaining, debt.currency)}.`,
        variant: "destructive",
      });
      return;
    }
    if (requiresConversion && !hasValidExchangeRate) {
      toast({
        title: "Tasa de cambio requerida",
        description: "Ingresa una tasa de cambio válida para continuar.",
        variant: "destructive",
      });
      return;
    }
    try {
      setSubmitting(true);
      await onConfirm({
        amount: numAmount,
        currency: debt.currency,
        accountId: Number(selectedAccountId),
        date: paymentDate,
        categoryId: selectedCategoryId ? Number(selectedCategoryId) : undefined,
        ...(requiresConversion ? { exchangeRate: numExchangeRate } : {}),
      });
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "No se pudo registrar el abono",
        description: err instanceof Error ? err.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isPayable = debt?.type === "payable";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full max-w-md max-h-[85vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>{isPayable ? "Abonar deuda" : "Registrar cobro"}</DialogTitle>
          <DialogDescription>
            {isPayable
              ? `Pago a ${debt?.contactName ?? ""}`
              : `Cobro de ${debt?.contactName ?? ""}`}
          </DialogDescription>
        </DialogHeader>

        {debt && (
          <div className="space-y-4">
            {/* Debt summary */}
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

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="debt-pay-amount">Monto a abonar ({debt.currency})</Label>
              <Input
                id="debt-pay-amount"
                type="number"
                step="0.01"
                min="0"
                max={debt.remaining}
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {/* Account selector */}
            <div className="space-y-2">
              <Label>{isPayable ? "Cuenta de origen" : "Cuenta destino"}</Label>
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
                <p className="text-xs text-muted-foreground">
                  Selecciona una cuenta para continuar.
                </p>
              )}
            </div>

            {requiresConversion && selectedAccount && (
              <div className="space-y-2">
                <Label htmlFor="debt-pay-exchange-rate">
                  Tasa de Cambio ({debt.currency} {"->"} {selectedAccount.currency})
                </Label>
                <Input
                  id="debt-pay-exchange-rate"
                  type="number"
                  step="0.000001"
                  min="0"
                  placeholder="0.000000"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Se registrará un movimiento de {convertedAmountPreview.toFixed(2)} {selectedAccount.currency} en tu cuenta
                </p>
              </div>
            )}

            {/* Category selector — pre-filled from debt */}
            {categories.length > 0 && (
              <div className="space-y-2">
                <Label>Categoría (opcional)</Label>
                <CategorySelector
                  value={selectedCategoryId}
                  onChange={setSelectedCategoryId}
                  categories={categories}
                />
              </div>
            )}

            {/* Payment date */}
            <div className="space-y-2">
              <Label htmlFor="debt-pay-date">Fecha</Label>
              <Input
                id="debt-pay-date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
          </div>
        )}

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
            disabled={!selectedAccountId || !amount || submitting || (requiresConversion && !hasValidExchangeRate)}
            onClick={handleConfirm}
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPayable ? "Registrar Pago" : "Registrar Cobro"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
