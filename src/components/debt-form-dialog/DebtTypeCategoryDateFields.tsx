import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategorySelector } from "@/components/CategorySelector";
import { UniversalDatePicker } from "@/components/UniversalDatePicker";
import type { Category, DebtType } from "@/lib/types";

export function DebtTypeCategoryDateFields({
  type,
  setType,
  lockType,
  categories,
  categoryId,
  setCategoryId,
  dueDate,
  setDueDate,
}: {
  type: DebtType;
  setType: (type: DebtType) => void;
  lockType: boolean;
  categories: Category[];
  categoryId: string;
  setCategoryId: (id: string) => void;
  dueDate: string;
  setDueDate: (date: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className="space-y-2">
        <Label>{t("debts.type")}</Label>
        <Select value={type} disabled={lockType} onValueChange={(v) => setType(v as DebtType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="payable">{t("debts.payable")}</SelectItem>
            <SelectItem value="receivable">{t("debts.receivable")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t("debts.categoryOptional")}</Label>
        <CategorySelector value={categoryId} onChange={setCategoryId} categories={categories} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="debt-due-date">{t("debts.dueDateOptional")}</Label>
        <UniversalDatePicker
          id="debt-due-date"
          value={dueDate || ""}
          onChange={setDueDate}
          placeholder={t("debts.selectDueDate")}
        />
      </div>
    </>
  );
}
