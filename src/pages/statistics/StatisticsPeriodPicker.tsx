import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerField } from "@/components/DatePickerField";
import { MonthYearSelect } from "./MonthYearSelect";
import type { MonthValue, PeriodPreset } from "./useStatisticsComparison";

export function StatisticsPeriodPicker({ preset, onPresetChange, custom, onCustomChange, months, onMonthsChange }: {
  preset: PeriodPreset; onPresetChange: (v: PeriodPreset) => void;
  custom: { currentFrom: string; currentTo: string; previousFrom: string; previousTo: string };
  onCustomChange: (v: typeof custom) => void;
  months: { current: MonthValue; previous: MonthValue };
  onMonthsChange: (v: typeof months) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t("statistics.comparePeriod")}</Label>
        <Select value={preset} onValueChange={(v) => onPresetChange(v as PeriodPreset)}>
          <SelectTrigger className="w-full sm:max-w-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="mtd_vs_last_month">{t("statistics.presetLastMonth")}</SelectItem>
            <SelectItem value="mtd_vs_last_year">{t("statistics.presetLastYear")}</SelectItem>
            <SelectItem value="pick_two_months">{t("statistics.presetTwoMonths")}</SelectItem>
            <SelectItem value="custom">{t("statistics.presetCustom")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {preset === "pick_two_months" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">{t("statistics.currentPeriod")}</Label>
            <MonthYearSelect value={months.current} onChange={(v) => onMonthsChange({ ...months, current: v })} />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">{t("statistics.comparePeriodWith")}</Label>
            <MonthYearSelect value={months.previous} onChange={(v) => onMonthsChange({ ...months, previous: v })} />
          </div>
        </div>
      ) : null}

      {preset === "custom" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">{t("statistics.currentPeriod")}</Label>
            <div className="flex gap-2">
              <DatePickerField value={custom.currentFrom} onChange={(v) => onCustomChange({ ...custom, currentFrom: v })} />
              <DatePickerField value={custom.currentTo} onChange={(v) => onCustomChange({ ...custom, currentTo: v })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">{t("statistics.comparePeriodWith")}</Label>
            <div className="flex gap-2">
              <DatePickerField value={custom.previousFrom} onChange={(v) => onCustomChange({ ...custom, previousFrom: v })} />
              <DatePickerField value={custom.previousTo} onChange={(v) => onCustomChange({ ...custom, previousTo: v })} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
