import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategorySelector } from "@/components/CategorySelector";
import type { Account, Category, Debt } from "@/lib/types";
import type { CreateSubscriptionForm } from "./types";

export function SubscriptionBasicFields({ form, idPrefix, accounts, categories, activeDebts }: {
  form: UseFormReturn<CreateSubscriptionForm>;
  idPrefix: string;
  accounts: Account[];
  categories: Category[];
  activeDebts: Debt[];
}) {
  const { t } = useTranslation();
  const { register, watch, setValue, formState: { errors, dirtyFields } } = form;
  const selectedSubType = watch("subscriptionType");
  const dirty = idPrefix === "edit" ? dirtyFields : undefined;

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-description`}>{t("subscriptions.descriptionLabel")}</Label>
        <Input
          id={`${idPrefix}-description`}
          placeholder={t("subscriptions.descriptionPlaceholder")}
          {...register("description", { required: t("subscriptions.descriptionRequired") })}
        />
        {errors.description ? <p className="text-xs text-destructive">{errors.description.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label>{t("subscriptions.type")}</Label>
        <Select
          value={selectedSubType}
          onValueChange={(v) => {
            setValue("subscriptionType", v as "gasto" | "ingreso", { shouldDirty: dirty !== undefined });
            setValue("debtId", "");
          }}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="gasto">{t("subscriptions.expense")}</SelectItem>
            <SelectItem value="ingreso">{t("subscriptions.income")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-2">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-amount`}>{t("subscriptions.amount")}</Label>
          <Input
            id={`${idPrefix}-amount`}
            type="number"
            step="0.01"
            min="0"
            {...register("amount", {
              valueAsNumber: true,
              required: t("subscriptions.amountRequired"),
              min: { value: 0.01, message: t("subscriptions.amountMin") },
            })}
          />
          {errors.amount ? <p className="text-xs text-destructive">{errors.amount.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label>{t("subscriptions.currency")}</Label>
          <Select value={watch("currency")} onValueChange={(v) => setValue("currency", v as "USD" | "EUR" | "VES")}>
            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="VES">VES</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t("subscriptions.category")}</Label>
        <CategorySelector
          value={watch("categoryId")}
          onChange={(id) => setValue("categoryId", id, { shouldValidate: true })}
          filterType={selectedSubType === "ingreso" ? "income" : "expense"}
          categories={categories}
        />
      </div>

      <div className="space-y-2">
        <Label>{t("subscriptions.account")}</Label>
        <Select
          value={watch("accountId") || "__none__"}
          onValueChange={(v) => setValue("accountId", v === "__none__" ? "" : v, { shouldValidate: true })}
        >
          <SelectTrigger><SelectValue placeholder={t("subscriptions.noAccountPlaceholder")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">{t("subscriptions.noAccount")}</SelectItem>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {activeDebts.length > 0 && (
        <div className="space-y-2">
          <Label>{t("subscriptions.linkDebt")}</Label>
          <Select
            value={watch("debtId") || "__none__"}
            onValueChange={(v) => setValue("debtId", v === "__none__" ? "" : v, { shouldValidate: true, shouldDirty: dirty !== undefined })}
          >
            <SelectTrigger><SelectValue placeholder={t("subscriptions.noDebtLinked")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">{t("subscriptions.noDebtLinked")}</SelectItem>
              {activeDebts
                .filter((d) => selectedSubType === "ingreso" ? d.type === "receivable" : d.type === "payable")
                .map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.contactName} — {d.type === "payable" ? t("subscriptions.payable") : t("subscriptions.receivable")}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );
}
