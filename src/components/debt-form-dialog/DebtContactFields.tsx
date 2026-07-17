import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DebtFormValues } from "./types";

export function DebtContactFields({
  register,
  errors,
}: {
  register: UseFormRegister<DebtFormValues>;
  errors: FieldErrors<DebtFormValues>;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="debt-contact">Contacto</Label>
        <Input
          id="debt-contact"
          placeholder="Nombre del contacto"
          {...register("contactName", { required: "El contacto es obligatorio." })}
        />
        {errors.contactName && (
          <p className="text-xs text-destructive">{errors.contactName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="debt-description">Descripción</Label>
        <Input
          id="debt-description"
          placeholder="Ej. Préstamo personal, Factura pendiente"
          {...register("description")}
        />
      </div>
    </>
  );
}
