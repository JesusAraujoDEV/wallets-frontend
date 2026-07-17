import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { RecurringExecutionMode } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FREQUENCY_OPTIONS, type CreateSubscriptionForm } from "./types";

export function SubscriptionScheduleFields({ form, idPrefix }: { form: UseFormReturn<CreateSubscriptionForm>; idPrefix: string }) {
  const { register, watch, setValue } = form;
  const selectedMode = watch("execution_mode");
  const selectedIsActive = watch("is_active");
  const selectedFrequency = watch("frequency");

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Frecuencia</Label>
          <Select value={selectedFrequency} onValueChange={(value) => setValue("frequency", value, { shouldValidate: true })}>
            <SelectTrigger><SelectValue placeholder="Seleccionar frecuencia" /></SelectTrigger>
            <SelectContent>
              {FREQUENCY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-next_date`}>{idPrefix === "edit" ? "Próximo cobro" : "Fecha de inicio"}</Label>
          <Input id={`${idPrefix}-next_date`} type="date" {...register("next_date", { required: true })} />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">¿Cómo pagas esto?</Label>
        <RadioGroup
          value={selectedMode}
          onValueChange={(v) => setValue("execution_mode", v as RecurringExecutionMode)}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          <label className={cn("cursor-pointer rounded-lg border p-4 transition-colors", selectedMode === "auto" && "border-primary ring-2 ring-primary/30")}>
            <RadioGroupItem value="auto" className="sr-only" />
            <p className="font-medium text-foreground">Automático</p>
            <p className="text-xs text-muted-foreground mt-1">Platica lo registrará solo cada mes (ideal para débitos automáticos).</p>
          </label>
          <label className={cn("cursor-pointer rounded-lg border p-4 transition-colors", selectedMode === "manual" && "border-primary ring-2 ring-primary/30")}>
            <RadioGroupItem value="manual" className="sr-only" />
            <p className="font-medium text-foreground">Recordatorio</p>
            <p className="text-xs text-muted-foreground mt-1">Platica te avisará para que confirmes la fecha, el monto y de qué cuenta lo pagaste.</p>
          </label>
        </RadioGroup>
      </div>

      <div className="rounded-lg border border-border p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">Suscripción activa</p>
            <p className="text-xs text-muted-foreground">Puedes pausar y reactivar cuando quieras.</p>
          </div>
          <Switch checked={selectedIsActive} onCheckedChange={(checked) => setValue("is_active", checked)} />
        </div>
      </div>
    </>
  );
}
