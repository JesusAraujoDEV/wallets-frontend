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
  return (
    <>
      <div className="space-y-2">
        <Label>Categoría</Label>
        <CategorySelector
          value={categoryId}
          onChange={onCategoryChange}
          filterType={filterType}
          categories={categories}
        />
      </div>

      <div className="space-y-2">
        <Label>Cuenta</Label>
        <Select
          value={accountId || "__none__"}
          onValueChange={(v) => onAccountChange(v === "__none__" ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sin cuenta asignada (opcional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Sin cuenta asignada</SelectItem>
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
