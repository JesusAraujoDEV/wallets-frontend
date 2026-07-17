import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MonthValue } from "./useStatisticsComparison";

const MONTH_KEYS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

export function MonthYearSelect({ value, onChange }: { value: MonthValue; onChange: (v: MonthValue) => void }) {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  return (
    <div className="flex gap-2">
      <Select value={String(value.month)} onValueChange={(v) => onChange({ ...value, month: Number(v) })}>
        <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
        <SelectContent>
          {MONTH_KEYS.map((key, i) => (
            <SelectItem key={key} value={String(i)}>{t(`statistics.months.${key}`)}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={String(value.year)} onValueChange={(v) => onChange({ ...value, year: Number(v) })}>
        <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
