import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="debt-contact">{t("debts.contact")}</Label>
        <Input
          id="debt-contact"
          placeholder={t("debts.contactNamePlaceholder")}
          {...register("contactName", { required: t("debts.contactRequired") })}
        />
        {errors.contactName && (
          <p className="text-xs text-destructive">{errors.contactName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="debt-description">{t("debts.description")}</Label>
        <Input
          id="debt-description"
          placeholder={t("debts.descriptionPlaceholder")}
          {...register("description")}
        />
      </div>
    </>
  );
}
