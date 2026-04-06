import { useEffect, useRef, useState } from "react";
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
import { UniversalDatePicker } from "@/components/UniversalDatePicker";
import { getRateByDate, type ExchangeSnapshot } from "@/lib/rates";
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

type Currency = "USD" | "EUR" | "VES";

function getDirectExchangeRate(
  fromCurrency: Currency,
  toCurrency: Currency,
  snapshot: ExchangeSnapshot,
): number | null {
  if (fromCurrency === toCurrency) return 1;

  if (fromCurrency === "USD" && toCurrency === "VES") return snapshot.vesPerUsd;
  if (fromCurrency === "EUR" && toCurrency === "VES") return snapshot.vesPerEur;
  if (fromCurrency === "VES" && toCurrency === "USD") return 1 / snapshot.vesPerUsd;
  if (fromCurrency === "VES" && toCurrency === "EUR") return 1 / snapshot.vesPerEur;

  if (fromCurrency === "USD" && toCurrency === "EUR") {
    return snapshot.vesPerUsd / snapshot.vesPerEur;
  }
  if (fromCurrency === "EUR" && toCurrency === "USD") {
    return snapshot.vesPerEur / snapshot.vesPerUsd;
  }

  return null;
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
  const [equivalentAmount, setEquivalentAmount] = useState("");
  const [officialRate, setOfficialRate] = useState<number | null>(null);
  const [manualEquivalentOverride, setManualEquivalentOverride] = useState(false);
  const [paymentDate, setPaymentDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [autoRateLoading, setAutoRateLoading] = useState(false);
  const [autoRateError, setAutoRateError] = useState<string | null>(null);
  const [autoRateSourceDate, setAutoRateSourceDate] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const amountRef = useRef(amount);
  const manualEquivalentOverrideRef = useRef(manualEquivalentOverride);

  useEffect(() => {
    amountRef.current = amount;
  }, [amount]);

  useEffect(() => {
    manualEquivalentOverrideRef.current = manualEquivalentOverride;
  }, [manualEquivalentOverride]);

  useEffect(() => {
    if (open && debt) {
      setAmount(String(debt.remaining));
      setSelectedAccountId("");
      setSelectedCategoryId(debt.categoryId || "");
      setEquivalentAmount("");
      setOfficialRate(null);
      setManualEquivalentOverride(false);
      setPaymentDate(new Date().toISOString().slice(0, 10));
      setAutoRateLoading(false);
      setAutoRateError(null);
      setAutoRateSourceDate(null);
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
  const numEquivalentAmount = Number(equivalentAmount);
  const hasValidEquivalentAmount =
    !requiresConversion ||
    (Boolean(equivalentAmount) && Number.isFinite(numEquivalentAmount) && numEquivalentAmount > 0);

  useEffect(() => {
    let cancelled = false;

    async function loadAutomaticRate() {
      if (!open || !debt || !selectedAccount || !requiresConversion || !paymentDate) return;

      setAutoRateLoading(true);
      setAutoRateError(null);
      setOfficialRate(null);
      if (!manualEquivalentOverrideRef.current) {
        setEquivalentAmount("");
      }

      try {
        const snapshot = await getRateByDate(paymentDate);
        if (!snapshot) throw new Error("No se encontró tasa BCV para la fecha seleccionada.");

        const directRate = getDirectExchangeRate(
          debt.currency,
          selectedAccount.currency,
          snapshot,
        );

        if (!directRate || !Number.isFinite(directRate) || directRate <= 0) {
          throw new Error("No se pudo calcular la tasa entre las monedas seleccionadas.");
        }

        if (!cancelled) {
          setOfficialRate(directRate);
          setManualEquivalentOverride(false);
          if (!manualEquivalentOverrideRef.current) {
            const currentAmount = Number(amountRef.current);
            if (Number.isFinite(currentAmount) && currentAmount > 0) {
              setEquivalentAmount((currentAmount * directRate).toFixed(2));
            } else {
              setEquivalentAmount("");
            }
          }
          setAutoRateSourceDate(snapshot.sourceDate);
        }
      } catch (error) {
        if (!cancelled) {
          setAutoRateError(
            error instanceof Error
              ? error.message
              : "No se pudo cargar la tasa BCV automáticamente.",
          );
          setOfficialRate(null);
          setAutoRateSourceDate(null);
        }
      } finally {
        if (!cancelled) setAutoRateLoading(false);
      }
    }

    if (!requiresConversion) {
      setAutoRateLoading(false);
      setAutoRateError(null);
      setAutoRateSourceDate(null);
      setOfficialRate(null);
      setEquivalentAmount("");
      setManualEquivalentOverride(false);
      return;
    }

    void loadAutomaticRate();

    return () => {
      cancelled = true;
    };
  }, [
    open,
    debt,
    selectedAccount,
    requiresConversion,
    paymentDate,
  ]);

  useEffect(() => {
    if (!requiresConversion || !officialRate || manualEquivalentOverride) return;

    const currentAmount = Number(amount);
    if (Number.isFinite(currentAmount) && currentAmount > 0) {
      setEquivalentAmount((currentAmount * officialRate).toFixed(2));
    } else {
      setEquivalentAmount("");
    }
  }, [amount, requiresConversion, officialRate, manualEquivalentOverride]);

  const numericAmount = Number(amount);
  const hasValidAmount = Number.isFinite(numericAmount) && numericAmount > 0;
  const implicitExchangeRate =
    requiresConversion && hasValidAmount && Number.isFinite(numEquivalentAmount) && numEquivalentAmount > 0
      ? numEquivalentAmount / numericAmount
      : NaN;
  const hasValidImplicitRate =
    !requiresConversion ||
    (Number.isFinite(implicitExchangeRate) && implicitExchangeRate > 0);
  const finalUsedAmount = requiresConversion ? numEquivalentAmount : numericAmount;
  const finalUsedRate = requiresConversion ? implicitExchangeRate : 1;
  const canRenderPreview =
    Boolean(debt && selectedAccount) &&
    hasValidAmount &&
    hasValidEquivalentAmount &&
    hasValidImplicitRate;

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
    if (!paymentDate) {
      toast({
        title: "Fecha requerida",
        description: "Selecciona la fecha del pago para continuar.",
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
    if (requiresConversion && !hasValidEquivalentAmount) {
      toast({
        title: "Monto debitado requerido",
        description: "Ingresa un monto a debitar válido para continuar.",
        variant: "destructive",
      });
      return;
    }

    const calculatedRate =
      requiresConversion && hasValidAmount && Number.isFinite(numEquivalentAmount) && numEquivalentAmount > 0
        ? numEquivalentAmount / numAmount
        : null;

    if (requiresConversion && (!calculatedRate || !Number.isFinite(calculatedRate) || calculatedRate <= 0)) {
      toast({
        title: "No se pudo calcular la tasa",
        description: "Verifica los montos ingresados para continuar.",
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
        ...(requiresConversion && calculatedRate ? { exchangeRate: calculatedRate } : {}),
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
                onChange={(e) => {
                  const nextAmount = e.target.value;
                  setAmount(nextAmount);
                  if (requiresConversion && officialRate && !manualEquivalentOverride) {
                    const parsedAmount = Number(nextAmount);
                    if (Number.isFinite(parsedAmount) && parsedAmount > 0) {
                      setEquivalentAmount((parsedAmount * officialRate).toFixed(2));
                    } else {
                      setEquivalentAmount("");
                    }
                  }
                }}
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
                <Label htmlFor="debt-pay-equivalent-amount">
                  Monto a debitar en {selectedAccount.currency}
                </Label>
                <div className="relative">
                  <Input
                    id="debt-pay-equivalent-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={equivalentAmount}
                    onChange={(e) => {
                      setEquivalentAmount(e.target.value);
                      setManualEquivalentOverride(true);
                    }}
                  />
                  {autoRateLoading && (
                    <div className="absolute inset-y-0 right-3 flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Se autocompleta según BCV para la fecha elegida y puedes ajustarlo si pagaste un monto distinto.
                </p>
                {officialRate && (
                  <p className="text-xs text-muted-foreground">
                    Tasa BCV oficial sugerida: {officialRate.toFixed(6)}
                  </p>
                )}
                {hasValidAmount && hasValidEquivalentAmount && hasValidImplicitRate && (
                  <p className="text-xs text-muted-foreground">
                    Tasa aplicada: {implicitExchangeRate.toFixed(6)}
                  </p>
                )}
                {autoRateSourceDate && (
                  <p className="text-xs text-muted-foreground">
                    Fuente BCV: {autoRateSourceDate}
                  </p>
                )}
                {autoRateError && (
                  <p className="text-xs text-destructive">{autoRateError}</p>
                )}
              </div>
            )}

            <div className="rounded-md border border-border bg-muted/30 p-3">
              {!selectedAccount && (
                <p className="text-xs text-muted-foreground">
                  Selecciona una cuenta para previsualizar el pago final.
                </p>
              )}
              {selectedAccount && !hasValidAmount && (
                <p className="text-xs text-muted-foreground">
                  Ingresa un monto válido para ver la previsualización.
                </p>
              )}
              {selectedAccount && hasValidAmount && requiresConversion && !hasValidEquivalentAmount && (
                <p className="text-xs text-muted-foreground">
                  Ingresa un monto a debitar válido para calcular la previsualización.
                </p>
              )}
              {canRenderPreview && debt && selectedAccount && (
                <p className="text-sm text-foreground">
                  Abonarás {numericAmount.toFixed(2)} {debt.currency} usando {finalUsedAmount.toFixed(2)} {selectedAccount.currency} (Tasa aplicada: {finalUsedRate.toFixed(6)})
                </p>
              )}
            </div>

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
              <UniversalDatePicker
                id="debt-pay-date"
                value={paymentDate}
                onChange={(date) => setPaymentDate(date)}
                placeholder="Seleccionar fecha de pago"
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
            disabled={!selectedAccountId || !amount || submitting || (requiresConversion && !hasValidEquivalentAmount)}
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
