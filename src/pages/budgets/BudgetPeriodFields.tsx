import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BudgetPeriod, RateSource } from "@/lib/types";
import type { BudgetFormValues } from "./types";

export function BudgetPeriodFields({ form, submitLoading }: {
  form: UseFormReturn<BudgetFormValues>;
  submitLoading: boolean;
}) {
  const { t } = useTranslation();
  const { register, setValue, watch, formState: { errors } } = form;
  const selectedPeriod = watch("period");
  const selectedRateSource = watch("rate_source");

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="budget-period">{t("budgets.period.label")}</Label>
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
            <SelectValue placeholder={t("budgets.period.placeholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">{t("budgets.period.monthly")}</SelectItem>
            <SelectItem value="yearly">{t("budgets.period.yearly")}</SelectItem>
            <SelectItem value="one_time">{t("budgets.period.oneTime")}</SelectItem>
          </SelectContent>
        </Select>
        <input type="hidden" {...register("period")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="budget-rate-source">{t("budgets.period.rateSource")}</Label>
        <Select
          value={selectedRateSource}
          onValueChange={(value: RateSource | "none") => setValue("rate_source", value)}
          disabled={submitLoading}
        >
          <SelectTrigger id="budget-rate-source">
            <SelectValue placeholder={t("budgets.period.rateSourcePlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{t("budgets.period.rateSourceNone")}</SelectItem>
            <SelectItem value="bcv">{t("budgets.period.rateSourceBcv")}</SelectItem>
            <SelectItem value="binance">{t("budgets.period.rateSourceBinance")}</SelectItem>
            <SelectItem value="eur">{t("budgets.period.rateSourceEur")}</SelectItem>
            <SelectItem value="usd">{t("budgets.period.rateSourceUsd")}</SelectItem>
          </SelectContent>
        </Select>
        <input type="hidden" {...register("rate_source")} />
      </div>

      {selectedPeriod === "one_time" ? (
        <div className="space-y-2">
          <Label htmlFor="budget-specific-month">{t("budgets.period.specificMonth")}</Label>
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
                  return t("budgets.period.specificMonthRequired");
                }

                return /^\d{4}-\d{2}$/.test(value) || t("budgets.period.specificMonthFormat");
              },
            })}
          />
          {errors.specific_month ? <p className="text-xs text-red-500">{errors.specific_month.message}</p> : null}
        </div>
      ) : null}
    </>
  );
}
