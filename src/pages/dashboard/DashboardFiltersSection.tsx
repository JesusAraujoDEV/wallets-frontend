import { useTranslation } from "react-i18next";
import { AccountSelector } from "@/components/AccountSelector";
import CategoryMultiSelect from "@/components/CategoryMultiSelect";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Category, CategoryGroup } from "@/lib/types";

export function DashboardFiltersSection({
  selectedAccount, onAccountChange, selectedGroupId, onGroupChange, groups,
  visibleIncomeCategories, selectedIncomeCats, onIncomeCatsChange,
  visibleExpenseCategories, selectedExpenseCats, onExpenseCatsChange,
}: {
  selectedAccount: string; onAccountChange: (v: string) => void;
  selectedGroupId: string; onGroupChange: (v: string) => void; groups: CategoryGroup[];
  visibleIncomeCategories: Category[]; selectedIncomeCats: string[]; onIncomeCatsChange: (v: string[]) => void;
  visibleExpenseCategories: Category[]; selectedExpenseCats: string[]; onExpenseCatsChange: (v: string[]) => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <AccountSelector selectedAccount={selectedAccount} onAccountChange={onAccountChange} />

      <div className="space-y-2">
        <Label htmlFor="group-filter">{t("dashboard.filters.categoryGroup")}</Label>
        <Select value={selectedGroupId} onValueChange={onGroupChange}>
          <SelectTrigger id="group-filter" className="w-full sm:max-w-sm">
            <SelectValue placeholder={t("dashboard.filters.allGroups")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("dashboard.filters.allGroups")}</SelectItem>
            {groups.map((group) => (
              <SelectItem key={group.id} value={String(group.id)}>{group.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedAccount === "all" ? (
        <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          <span className="font-semibold">{t("dashboard.filters.globalViewTitle")}</span> {t("dashboard.filters.globalViewDesc")}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-foreground">
          <span className="font-semibold">{t("dashboard.filters.accountViewTitle")}</span> {t("dashboard.filters.accountViewDesc")}
        </div>
      )}

      <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
        <CategoryMultiSelect
          label={t("dashboard.filters.chooseIncomeCategories")}
          categories={visibleIncomeCategories}
          selected={selectedIncomeCats}
          onChange={onIncomeCatsChange}
          placeholder={t("dashboard.filters.allIncomeCategories")}
        />
        <CategoryMultiSelect
          label={t("dashboard.filters.chooseExpenseCategories")}
          categories={visibleExpenseCategories}
          selected={selectedExpenseCats}
          onChange={onExpenseCatsChange}
          placeholder={t("dashboard.filters.allExpenseCategories")}
        />
      </div>
    </>
  );
}
