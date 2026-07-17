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
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Frecuencia</Label>
          <Select value={frequency} onValueChange={onFrequencyChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar frecuencia" />
            </SelectTrigger>
            <SelectContent>
              {FREQUENCY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Fecha de inicio</Label>
          <UniversalDatePicker value={nextDate} onChange={onNextDateChange} placeholder="Seleccionar fecha" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Modo de ejecución</Label>
        <Select value={executionMode} onValueChange={(v) => onExecutionModeChange(v as RecurringExecutionMode)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Automático</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
