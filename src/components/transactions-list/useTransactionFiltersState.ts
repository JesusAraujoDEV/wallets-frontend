import { useEffect, useState } from "react";

export function useTransactionFiltersState() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [filterIncomeCategories, setFilterIncomeCategories] = useState<string[]>([]);
  const [filterExpenseCategories, setFilterExpenseCategories] = useState<string[]>([]);
  const [filterAccounts, setFilterAccounts] = useState<string[]>([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [dateMode, setDateMode] = useState<"none" | "day" | "range" | "month">("none");

  useEffect(() => {
    if (filterType === 'income' && filterExpenseCategories.length) setFilterExpenseCategories([]);
    else if (filterType === 'expense' && filterIncomeCategories.length) setFilterIncomeCategories([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType]);

  const handleClearFilters = () => {
    setSearchQuery(""); setFilterType("all"); setFilterIncomeCategories([]); setFilterExpenseCategories([]);
    setFilterAccounts([]); setFilterDate(""); setFilterDateFrom(""); setFilterDateTo(""); setFilterMonth(""); setDateMode("none");
  };

  const filtersPack = {
    searchQuery, filterType, filterIncomeCategories, filterExpenseCategories, filterAccounts,
    dateMode, filterDate, filterDateFrom, filterDateTo, filterMonth,
  };

  const isAnyFilterActive = Boolean(
    (searchQuery && searchQuery.trim()) || filterType !== 'all' || filterIncomeCategories.length ||
    filterExpenseCategories.length || filterAccounts.length ||
    (dateMode === 'day' && filterDate) || (dateMode === 'range' && (filterDateFrom || filterDateTo)) || (dateMode === 'month' && filterMonth)
  );

  return {
    searchQuery, setSearchQuery, filterType, setFilterType,
    filterIncomeCategories, setFilterIncomeCategories, filterExpenseCategories, setFilterExpenseCategories,
    filterAccounts, setFilterAccounts, dateMode, setDateMode,
    filterDate, setFilterDate, filterDateFrom, setFilterDateFrom, filterDateTo, setFilterDateTo, filterMonth, setFilterMonth,
    filtersPack, isAnyFilterActive, handleClearFilters,
  };
}
