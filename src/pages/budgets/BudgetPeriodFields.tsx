import type { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BudgetPeriod, RateSource } from "@/lib/types";
import type { BudgetFormValues } from "./types";

export function BudgetPeriodFields({ form, submitLoading }: {
  form: UseFormReturn<BudgetFormValues>;
  submitLoading: boolean;
}) {
  const { register, setValue, watch, formState: { errors } } = form;
  const selectedPeriod = watch("period");
  const selectedRateSource = watch("rate_source");

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="budget-period">Período</Label>
        <Select
          value={selectedPeriod}
          onValueChange={(value: BudgetPeriod) => {
            setValue("period", value, { shouldValidate: true });
            if (value !== "one_time") {
              setValue("specific_month", "", { shouldValidate: true });
            }
          }}
          disabled={submitLoading}
        >
          <SelectTrigger id="budget-period">
            <SelectValue placeholder="Selecciona un período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Mensual</SelectItem>
            <SelectItem value="yearly">Anual</SelectItem>
            <SelectItem value="one_time">Única Vez</SelectItem>
          </SelectContent>
        </Select>
        <input type="hidden" {...register("period")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="budget-rate-source">Tasa de referencia (opcional)</Label>
        <Select
          value={selectedRateSource}
          onValueChange={(value: RateSource | "none") => setValue("rate_source", value)}
          disabled={submitLoading}
        >
          <SelectTrigger id="budget-rate-source">
            <SelectValue placeholder="Sin especificar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sin especificar</SelectItem>
            <SelectItem value="bcv">BCV</SelectItem>
            <SelectItem value="binance">Binance</SelectItem>
            <SelectItem value="eur">Euro</SelectItem>
            <SelectItem value="usd">USD</SelectItem>
          </SelectContent>
        </Select>
        <input type="hidden" {...register("rate_source")} />
      </div>

      {selectedPeriod === "one_time" ? (
        <div className="space-y-2">
          <Label htmlFor="budget-specific-month">Mes específico</Label>
          <input
            id="budget-specific-month"
            type="month"
            disabled={submitLoading}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            {...register("specific_month", {
              validate: (value) => {
                if (selectedPeriod !== "one_time") {
                  return true;
                }

                if (!value) {
                  return "El mes específico es obligatorio para presupuestos de única vez.";
                }

                return /^\d{4}-\d{2}$/.test(value) || "El mes específico debe tener formato YYYY-MM.";
              },
            })}
          />
          {errors.specific_month ? <p className="text-xs text-red-500">{errors.specific_month.message}</p> : null}
        </div>
      ) : null}
    </>
  );
}
