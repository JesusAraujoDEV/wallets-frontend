import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { vesPerUnit, type DisplayCurrency } from "@/lib/displayCurrency";
import type { ExchangeRate } from "@/lib/rates";

type CalcCurrency = "VES" | DisplayCurrency;

const CURRENCIES: CalcCurrency[] = ["VES", "USD", "EUR", "USDT"];

function vesPerCalcUnit(rate: ExchangeRate, currency: CalcCurrency): number | null {
  if (currency === "VES") return 1;
  return vesPerUnit(rate, currency);
}

function fmt(value: number | null): string {
  if (value == null || !isFinite(value)) return "—";
  return value.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

interface RateCalculatorProps {
  rate: ExchangeRate | undefined;
  loading: boolean;
}

export function RateCalculator({ rate, loading }: RateCalculatorProps) {
  const { t } = useTranslation();
  const [amountInput, setAmountInput] = useState("1");
  const [from, setFrom] = useState<CalcCurrency>("VES");

  const amount = Number(amountInput);
  const amountValid = amountInput.trim() !== "" && isFinite(amount);

  const results = useMemo(() => {
    if (!rate || !amountValid) return null;
    const fromVesPerUnit = vesPerCalcUnit(rate, from);
    if (!fromVesPerUnit) return null;
    const amountInVes = amount * fromVesPerUnit;
    return CURRENCIES.filter((c) => c !== from).map((currency) => {
      const targetVesPerUnit = vesPerCalcUnit(rate, currency);
      const value = targetVesPerUnit ? amountInVes / targetVesPerUnit : null;
      return { currency, value };
    });
  }, [rate, amountValid, amount, from]);

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{t("rates.calculatorTitle")}</CardTitle>
        <p className="text-xs text-muted-foreground">{t("rates.calculatorSubtitle")}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs text-muted-foreground">{t("rates.amount")}</label>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              placeholder={t("rates.amountPlaceholder")}
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="w-full space-y-1.5 sm:w-40">
            <label className="text-xs text-muted-foreground">{t("rates.fromCurrency")}</label>
            <Select value={from} onValueChange={(v) => setFrom(v as CalcCurrency)} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c === "USDT" ? t("rates.usdt") : t(`rates.${c.toLowerCase()}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">{t("rates.calculatorLoading")}</p>
        ) : !rate ? (
          <p className="text-sm text-muted-foreground">{t("rates.calculatorUnavailable")}</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(results ?? CURRENCIES.filter((c) => c !== from).map((currency) => ({ currency, value: null }))).map(
              ({ currency, value }) => (
                <div key={currency} className="rounded-md border border-border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">
                    {currency === "USDT" ? t("rates.usdt") : t(`rates.${currency.toLowerCase()}`)}
                  </p>
                  <p className="text-lg font-semibold text-foreground">{fmt(value)}</p>
                </div>
              ),
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
