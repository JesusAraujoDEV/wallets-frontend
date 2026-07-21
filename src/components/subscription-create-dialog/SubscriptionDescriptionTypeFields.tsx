import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="description">{t("subscriptions.descriptionLabel")}</Label>
        <Input
          id="description"
          placeholder={t("subscriptions.descriptionPlaceholder")}
          {...register("description", { required: t("subscriptions.descriptionRequired") })}
        />
        {errors.description ? <p className="text-xs text-destructive">{errors.description.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label>{t("subscriptions.type")}</Label>
        <Select
          value={selectedSubType}
          disabled={lockType}
          onValueChange={(v) => onTypeChange(v as "gasto" | "ingreso")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gasto">{t("subscriptions.expense")}</SelectItem>
            <SelectItem value="ingreso">{t("subscriptions.income")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
