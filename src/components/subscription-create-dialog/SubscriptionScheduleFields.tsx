import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UniversalDatePicker } from "@/components/UniversalDatePicker";
import type { RecurringExecutionMode } from "@/lib/types";
import { FREQUENCY_OPTIONS } from "./types";

export function SubscriptionScheduleFields({
  frequency,
  onFrequencyChange,
  nextDate,
  onNextDateChange,
  executionMode,
  onExecutionModeChange,
}: {
  frequency: string;
  onFrequencyChange: (value: string) => void;
  nextDate: string;
  onNextDateChange: (value: string) => void;
  executionMode: RecurringExecutionMode;
  onExecutionModeChange: (value: RecurringExecutionMode) => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("subscriptions.frequency")}</Label>
          <Select value={frequency} onValueChange={onFrequencyChange}>
            <SelectTrigger>
              <SelectValue placeholder={t("subscriptions.selectFrequency")} />
            </SelectTrigger>
            <SelectContent>
              {FREQUENCY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t("subscriptions.startDate")}</Label>
          <UniversalDatePicker value={nextDate} onChange={onNextDateChange} placeholder={t("subscriptions.selectDate")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t("subscriptions.executionMode")}</Label>
        <Select value={executionMode} onValueChange={(v) => onExecutionModeChange(v as RecurringExecutionMode)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">{t("subscriptions.auto")}</SelectItem>
            <SelectItem value="manual">{t("subscriptions.manual")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
