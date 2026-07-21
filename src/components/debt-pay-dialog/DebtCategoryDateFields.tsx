import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { CategorySelector } from "@/components/CategorySelector";
import { UniversalDatePicker } from "@/components/UniversalDatePicker";
import type { Category } from "@/lib/types";

export function DebtCategoryDateFields({
  categories, selectedCategoryId, setSelectedCategoryId, paymentDate, setPaymentDate,
}: {
  categories: Category[];
  selectedCategoryId: string;
  setSelectedCategoryId: (v: string) => void;
  paymentDate: string;
  setPaymentDate: (v: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      {categories.length > 0 && (
        <div className="space-y-2">
          <Label>{t("debts.categoryOptional")}</Label>
          <CategorySelector
            value={selectedCategoryId}
            onChange={setSelectedCategoryId}
            categories={categories}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="debt-pay-date">{t("debts.date")}</Label>
        <UniversalDatePicker
          id="debt-pay-date"
          value={paymentDate}
          onChange={(date) => setPaymentDate(date)}
          placeholder={t("debts.selectPaymentDate")}
        />
      </div>
    </>
  );
}
