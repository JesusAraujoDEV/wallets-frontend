import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Search, X } from "lucide-react";
import CategoryMultiSelect from "@/components/CategoryMultiSelect";
import AccountMultiSelect from "@/components/AccountMultiSelect";
import type { Category, Account } from "@/lib/types";

export type TransactionFiltersProps = {
  searchQuery: string; setSearchQuery: (v: string) => void;
  filterType: "all" | "income" | "expense"; setFilterType: (v: "all" | "income" | "expense") => void;
  filterIncomeCategories: string[]; setFilterIncomeCategories: (v: string[]) => void;
  filterExpenseCategories: string[]; setFilterExpenseCategories: (v: string[]) => void;
  filterAccounts: string[]; setFilterAccounts: (v: string[]) => void;
  dateMode: "none" | "day" | "range" | "month"; setDateMode: (v: "none" | "day" | "range" | "month") => void;
  filterDate: string; setFilterDate: (v: string) => void;
  filterDateFrom: string; setFilterDateFrom: (v: string) => void;
  filterDateTo: string; setFilterDateTo: (v: string) => void;
  filterMonth: string; setFilterMonth: (v: string) => void;
  categories: Category[];
  accounts: Account[];
  onClear: () => void;
};

const DATE_MODE_OPTIONS = [
  { value: "day", label: "Día exacto" },
  { value: "range", label: "Rango" },
  { value: "month", label: "Mes" },
] as const;

export const TransactionFilters = (props: TransactionFiltersProps) => {
  const {
    searchQuery, setSearchQuery,
    filterType, setFilterType,
    filterIncomeCategories, setFilterIncomeCategories,
    filterExpenseCategories, setFilterExpenseCategories,
    filterAccounts, setFilterAccounts,
    dateMode, setDateMode,
    filterDate, setFilterDate,
    filterDateFrom, setFilterDateFrom,
    filterDateTo, setFilterDateTo,
    filterMonth, setFilterMonth,
    categories, accounts,
    onClear,
  } = props;

  const incomeCategoryOptions = useMemo(() => categories.filter(c => c.type === 'income'), [categories]);
  const expenseCategoryOptions = useMemo(() => categories.filter(c => c.type === 'expense'), [categories]);

  return (
    <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
          <Label htmlFor="tx-search">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="tx-search"
              placeholder="Descripción o categoría..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tx-type">Tipo</Label>
          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger id="tx-type" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="income">Ingresos</SelectItem>
              <SelectItem value="expense">Gastos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <CategoryMultiSelect
            label="Categorías de ingreso"
            categories={incomeCategoryOptions}
            selected={filterIncomeCategories}
            onChange={setFilterIncomeCategories}
            placeholder="Todas"
          />
        </div>
        <div className="space-y-1.5">
          <CategoryMultiSelect
            label="Categorías de gasto"
            categories={expenseCategoryOptions}
            selected={filterExpenseCategories}
            onChange={setFilterExpenseCategories}
            placeholder="Todas"
          />
        </div>
        <div className="space-y-1.5">
          <AccountMultiSelect
            label="Cuentas"
            accounts={accounts}
            selected={filterAccounts}
            onChange={setFilterAccounts}
            placeholder="Todas las cuentas"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <Label>Filtrar por fecha</Label>
          <RadioGroup value={dateMode} onValueChange={(v: any) => setDateMode(v)} className="flex flex-wrap gap-4">
            {DATE_MODE_OPTIONS.map((opt) => (
              <div key={opt.value} className="flex items-center space-x-2">
                <RadioGroupItem value={opt.value} id={`dm-${opt.value}`} />
                <Label htmlFor={`dm-${opt.value}`} className="text-sm font-normal cursor-pointer">{opt.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          {dateMode === 'day' && (
            <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-auto" />
          )}
          {dateMode === 'range' && (
            <>
              <Input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="w-auto" aria-label="Desde" />
              <Input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="w-auto" aria-label="Hasta" />
            </>
          )}
          {dateMode === 'month' && (
            <Input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="w-auto" />
          )}
          <Button variant="ghost" size="sm" onClick={onClear} className="gap-1.5 text-muted-foreground">
            <X className="h-3.5 w-3.5" />
            Limpiar filtros
          </Button>
        </div>
      </div>
    </div>
  );
};
