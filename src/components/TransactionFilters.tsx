import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Search } from "lucide-react";
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
    <div className="space-y-3">
      {/* Compact top row for small screens */}
      <div className="grid grid-cols-1 sm:hidden gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expenses</SelectItem>
            </SelectContent>
          </Select>
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="whitespace-nowrap">More Filters</Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-3">
              <CategoryMultiSelect
                label="Categorías de Ingreso"
                categories={incomeCategoryOptions}
                selected={filterIncomeCategories}
                onChange={setFilterIncomeCategories}
                placeholder="Todas"
              />
              <CategoryMultiSelect
                label="Categorías de Gasto"
                categories={expenseCategoryOptions}
                selected={filterExpenseCategories}
                onChange={setFilterExpenseCategories}
                placeholder="Todas"
              />
              <AccountMultiSelect
                label="Accounts"
                accounts={accounts}
                selected={filterAccounts}
                onChange={setFilterAccounts}
                placeholder="All Accounts"
              />
              <div className="space-y-2">
                <div className="space-y-2">
                  <Label className="text-sm">Date filter</Label>
                  <RadioGroup value={dateMode} onValueChange={(v: any) => setDateMode(v)} className="grid grid-cols-3 gap-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="day" id="dm-day-sm" />
                      <Label htmlFor="dm-day-sm" className="text-sm">Exact day</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="range" id="dm-range-sm" />
                      <Label htmlFor="dm-range-sm" className="text-sm">Range</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="month" id="dm-month-sm" />
                      <Label htmlFor="dm-month-sm" className="text-sm">Month</Label>
                    </div>
                  </RadioGroup>
                </div>
                {dateMode === 'day' && (
                  <div className="flex items-center gap-2">
                    <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-full" />
                  </div>
                )}
                {dateMode === 'range' && (
                  <div className="flex items-center gap-2">
                    <Input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="w-full" placeholder="From" />
                    <Input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="w-full" placeholder="To" />
                  </div>
                )}
                {dateMode === 'month' && (
                  <div className="flex items-center gap-2">
                    <Input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="w-full" />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={onClear}>Clear</Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {/* Full filter bar for >= sm */}
      <div className="hidden sm:grid items-end gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-8">
        <div className="relative sm:col-span-2 lg:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="lg:col-span-1">
          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expenses</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="lg:col-span-1">
          <CategoryMultiSelect
            label="Categorías de Ingreso"
            categories={incomeCategoryOptions}
            selected={filterIncomeCategories}
            onChange={setFilterIncomeCategories}
            placeholder="Todas"
          />
        </div>
        <div className="lg:col-span-1">
          <CategoryMultiSelect
            label="Categorías de Gasto"
            categories={expenseCategoryOptions}
            selected={filterExpenseCategories}
            onChange={setFilterExpenseCategories}
            placeholder="Todas"
          />
        </div>
        <div className="lg:col-span-1">
          <AccountMultiSelect
            label="Accounts"
            accounts={accounts}
            selected={filterAccounts}
            onChange={setFilterAccounts}
            placeholder="All Accounts"
          />
        </div>
        <div className="flex flex-col gap-2 lg:col-span-2">
          <div className="flex items-center gap-4">
            <Label className="text-sm">Date filter</Label>
            <div className="flex items-center gap-4">
              <RadioGroup value={dateMode} onValueChange={(v: any) => setDateMode(v)} className="grid grid-cols-3 gap-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="day" id="dm-day" />
                  <Label htmlFor="dm-day" className="text-sm">Exact day</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="range" id="dm-range" />
                  <Label htmlFor="dm-range" className="text-sm">Range</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="month" id="dm-month" />
                  <Label htmlFor="dm-month" className="text-sm">Month</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          {dateMode === 'day' && (
            <div className="flex items-center gap-2">
              <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-full" />
            </div>
          )}
          {dateMode === 'range' && (
            <div className="flex items-center gap-2">
              <Input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="w-full" placeholder="From" />
              <Input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="w-full" placeholder="To" />
            </div>
          )}
          {dateMode === 'month' && (
            <div className="flex items-center gap-2">
              <Input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="w-full" />
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClear}>Clear</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
