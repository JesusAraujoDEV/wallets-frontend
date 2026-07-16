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
  return (
    <>
      <AccountSelector selectedAccount={selectedAccount} onAccountChange={onAccountChange} />

      <div className="space-y-2">
        <Label htmlFor="group-filter">Grupo de Categoría</Label>
        <Select value={selectedGroupId} onValueChange={onGroupChange}>
          <SelectTrigger id="group-filter" className="w-full sm:max-w-sm">
            <SelectValue placeholder="Todos los grupos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los grupos</SelectItem>
            {groups.map((group) => (
              <SelectItem key={group.id} value={String(group.id)}>{group.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedAccount === "all" ? (
        <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          <span className="font-semibold">Vista global:</span> mostrando datos agregados de todas las cuentas.
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-foreground">
          <span className="font-semibold">Vista de cuenta:</span> mostrando datos solo de la cuenta seleccionada.
        </div>
      )}

      <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
        <CategoryMultiSelect
          label="Elegir categorías Income"
          categories={visibleIncomeCategories}
          selected={selectedIncomeCats}
          onChange={onIncomeCatsChange}
          placeholder="Todas las categorías de Income"
        />
        <CategoryMultiSelect
          label="Elegir categorías Expense"
          categories={visibleExpenseCategories}
          selected={selectedExpenseCats}
          onChange={onExpenseCatsChange}
          placeholder="Todas las categorías de Expense"
        />
      </div>
    </>
  );
}
