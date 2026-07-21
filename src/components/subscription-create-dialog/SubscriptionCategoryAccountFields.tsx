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
import type { Account, Category } from "@/lib/types";

export function SubscriptionCategoryAccountFields({
  categories,
  categoryId,
  onCategoryChange,
  filterType,
  accounts,
  accountId,
  onAccountChange,
}: {
  categories: Category[];
  categoryId: string;
  onCategoryChange: (id: string) => void;
  filterType: "income" | "expense";
  accounts: Account[];
  accountId: string;
  onAccountChange: (id: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className="space-y-2">
        <Label>{t("subscriptions.category")}</Label>
        <CategorySelector
          value={categoryId}
          onChange={onCategoryChange}
          filterType={filterType}
          categories={categories}
        />
      </div>

      <div className="space-y-2">
        <Label>{t("subscriptions.account")}</Label>
        <Select
          value={accountId || "__none__"}
          onValueChange={(v) => onAccountChange(v === "__none__" ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("subscriptions.noAccountPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">{t("subscriptions.noAccount")}</SelectItem>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
