import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateSubscriptionForm } from "./types";

export function SubscriptionDescriptionTypeFields({
  register,
  errors,
  selectedSubType,
  lockType,
  onTypeChange,
}: {
  register: UseFormRegister<CreateSubscriptionForm>;
  errors: FieldErrors<CreateSubscriptionForm>;
  selectedSubType: "gasto" | "ingreso";
  lockType: boolean;
  onTypeChange: (type: "gasto" | "ingreso") => void;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Input
          id="description"
          placeholder="Ej. Netflix, Spotify, Renta"
          {...register("description", { required: "La descripción es obligatoria." })}
        />
        {errors.description ? <p className="text-xs text-destructive">{errors.description.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label>Tipo</Label>
        <Select
          value={selectedSubType}
          disabled={lockType}
          onValueChange={(v) => onTypeChange(v as "gasto" | "ingreso")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gasto">Gasto</SelectItem>
            <SelectItem value="ingreso">Ingreso</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
