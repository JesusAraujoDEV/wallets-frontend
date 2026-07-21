import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { AccountsStore, CategoriesStore, TransactionsStore, onDataChange } from "@/lib/storage";
import type { Category, Account } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionFilters } from "@/components/TransactionFilters";
import { TransactionsDeleteConfirm } from "@/components/TransactionsDeleteConfirm";
import { PAGE_SIZE_DEFAULT } from "@/lib/transactions";
import { useTransactionsQuery } from "@/hooks/use-transactions-query";
import { useTransactionFiltersState } from "./transactions-list/useTransactionFiltersState";
import { useGroupedTransactions } from "./transactions-list/useGroupedTransactions";
import { useDailyRates } from "./transactions-list/useDailyRates";
import { useDailyTotals } from "./transactions-list/useDailyTotals";
import { useTransactionEditForm } from "./transactions-list/useTransactionEditForm";
import { useTransactionExport } from "./transactions-list/useTransactionExport";
import { TransactionGroupList } from "./transactions-list/TransactionGroupList";
import { TransactionEditDialog } from "./transactions-list/TransactionEditDialog";
import { TransactionExportDialog } from "./transactions-list/TransactionExportDialog";

export const TransactionsList = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const filters = useTransactionFiltersState();
  const { transactions, rawItems, pageLoading, hasMore, fetchNextPage, refetch, firstReloadTick } = useTransactionsQuery({
    filters: filters.filtersPack, pageSize: PAGE_SIZE_DEFAULT,
  });

  useEffect(() => {
    const load = () => { setCategories(CategoriesStore.all()); setAccounts(AccountsStore.all()); };
    load();
    return onDataChange(load);
  }, []);

  useEffect(() => {
    AccountsStore.refresh().catch(() => {});
    CategoriesStore.refresh().catch(() => {});
  }, []);

  const { filteredTransactions, groupedTransactions } = useGroupedTransactions(transactions, filters.filterType, filters.isAnyFilterActive, categories);
  const dates = useMemo(() => Object.keys(groupedTransactions), [groupedTransactions]);
  const vesRateByDate = useDailyRates(dates, firstReloadTick);
  const groupTotals = useDailyTotals(groupedTransactions, categories, vesRateByDate, firstReloadTick);

  const editForm = useTransactionEditForm(refetch);
  const exportState = useTransactionExport({ filtersPack: filters.filtersPack, rawItems });
  const editCategories = useMemo(() => categories.filter(c => c.type === editForm.formData.type), [categories, editForm.formData.type]);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await TransactionsStore.remove(id);
      await refetch();
      toast({ title: t("transactionsPage.deletedToastTitle"), description: t("transactionsPage.deletedToastDesc") });
    } finally {
      setDeletingId(null);
    }
  };

  const totalIncome = Object.values(groupTotals).reduce((s, g) => s + g.income, 0);
  const totalExpenses = Object.values(groupTotals).reduce((s, g) => s + g.expenses, 0);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <CardTitle>{t("transactionsPage.listTitle")}</CardTitle>
            <CardDescription>{t("transactionsPage.listSubtitle")}</CardDescription>
          </div>
          <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:justify-between sm:gap-4">
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <Button onClick={() => setIsAddOpen(true)} className="w-full gap-2 sm:w-auto">
                <Plus className="h-4 w-4" /> {t("transactionsPage.newTransaction")}
              </Button>
              <DialogContent className="w-[95vw] max-w-md sm:max-w-lg mx-auto max-h-[85vh] overflow-y-auto rounded-xl">
                <DialogHeader><DialogTitle>{t("transactionsPage.addTransactionTitle")}</DialogTitle></DialogHeader>
                <TransactionForm asModalContent onSubmitted={async () => { setIsAddOpen(false); await refetch(); }} />
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="w-full gap-2 sm:w-auto" onClick={() => exportState.setIsExportOpen(true)}>
              <Download className="h-4 w-4" /> {t("transactionsPage.downloadTransfers")}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <TransactionFilters
          searchQuery={filters.searchQuery} setSearchQuery={filters.setSearchQuery}
          filterType={filters.filterType} setFilterType={filters.setFilterType}
          filterIncomeCategories={filters.filterIncomeCategories} setFilterIncomeCategories={filters.setFilterIncomeCategories}
          filterExpenseCategories={filters.filterExpenseCategories} setFilterExpenseCategories={filters.setFilterExpenseCategories}
          filterAccounts={filters.filterAccounts} setFilterAccounts={filters.setFilterAccounts}
          dateMode={filters.dateMode} setDateMode={filters.setDateMode}
          filterDate={filters.filterDate} setFilterDate={filters.setFilterDate}
          filterDateFrom={filters.filterDateFrom} setFilterDateFrom={filters.setFilterDateFrom}
          filterDateTo={filters.filterDateTo} setFilterDateTo={filters.setFilterDateTo}
          filterMonth={filters.filterMonth} setFilterMonth={filters.setFilterMonth}
          categories={categories} accounts={accounts} onClear={filters.handleClearFilters}
        />

        {dates.length > 0 ? (
          <div className="flex items-center gap-2 text-xs sm:text-sm flex-wrap">
            <Badge variant="outline" className="border-green-500 text-green-600">{t("transactionsPage.totalIncome")}: ${totalIncome.toFixed(2)}</Badge>
            <Badge variant="outline" className="border-red-500 text-red-600">{t("transactionsPage.totalExpenses")}: -${totalExpenses.toFixed(2)}</Badge>
            <Badge variant="secondary" className="font-semibold">{t("transactionsPage.net")}: {(totalIncome - totalExpenses).toFixed(2)}</Badge>
          </div>
        ) : null}

        <TransactionGroupList
          groupedTransactions={groupedTransactions} vesRateByDate={vesRateByDate} groupTotals={groupTotals}
          categories={categories} accounts={accounts} deletingId={deletingId}
          onEdit={editForm.handleEdit} onDeleteRequest={setConfirmDeleteId}
          isEmpty={filteredTransactions.length === 0} pageLoading={pageLoading} hasMore={hasMore} onLoadMore={fetchNextPage}
        />
      </CardContent>

      <TransactionEditDialog
        open={editForm.isDialogOpen} onOpenChange={editForm.setIsDialogOpen}
        formData={editForm.formData} setFormData={editForm.setFormData}
        categories={categories} editCategories={editCategories} accounts={accounts}
        saving={editForm.saving} onSubmit={editForm.handleUpdate} onCancel={() => editForm.setIsDialogOpen(false)}
      />

      <TransactionExportDialog
        open={exportState.isExportOpen} onOpenChange={exportState.setIsExportOpen}
        exportAll={exportState.exportAll} setExportAll={exportState.setExportAll}
        exporting={exportState.exporting} onExport={exportState.runExport}
      />

      <TransactionsDeleteConfirm
        open={!!confirmDeleteId}
        onOpenChange={(open) => setConfirmDeleteId(open ? confirmDeleteId : null)}
        busy={!!deletingId}
        onConfirm={async () => { if (!confirmDeleteId) return; await handleDelete(confirmDeleteId); setConfirmDeleteId(null); }}
      />
    </Card>
  );
};
