import { Loader2 } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Category } from "@/lib/types";
import { BudgetPeriodFields } from "./BudgetPeriodFields";
import type { BudgetFormValues } from "./types";

export function BudgetFormDialog({
  open, onOpenChange, isEditing, form, onSubmit, submitLoading, expenseCategories, onCancel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  form: UseFormReturn<BudgetFormValues>;
  onSubmit: (event: React.FormEvent) => void;
  submitLoading: boolean;
  expenseCategories: Category[];
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const { register, setValue, watch, formState: { errors } } = form;
  const selectedCategoryId = watch("categoryId");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? t("budgets.form.editTitle") : t("budgets.create")}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? t("budgets.form.editDescription")
              : t("budgets.form.createDescription")}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="budget-category">{t("budgets.form.category")}</Label>
            <Select
              value={selectedCategoryId}
              onValueChange={(value) => setValue("categoryId", value, { shouldValidate: true })}
              disabled={submitLoading}
            >
              <SelectTrigger id="budget-category">
                <SelectValue placeholder={t("budgets.form.categoryPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">{t("budgets.form.globalBudget")}</SelectItem>
                {expenseCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" {...register("categoryId")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget-amount">{t("budgets.form.amount")}</Label>
            <Input
              id="budget-amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              disabled={submitLoading}
              {...register("amount", {
                valueAsNumber: true,
                required: t("budgets.form.amountRequired"),
                validate: (value) => (Number.isFinite(value) && value > 0) || t("budgets.form.amountPositive"),
              })}
            />
            {errors.amount ? <p className="text-xs text-red-500">{errors.amount.message}</p> : null}
          </div>

          <BudgetPeriodFields form={form} submitLoading={submitLoading} />

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-4">
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onCancel} disabled={submitLoading}>
              {t("budgets.form.cancel")}
            </Button>
            <Button type="submit" className="w-full sm:w-auto" disabled={submitLoading} aria-busy={submitLoading}>
              {submitLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("budgets.form.saving")}
                </>
              ) : (
                isEditing ? t("budgets.form.update") : t("budgets.form.save")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
