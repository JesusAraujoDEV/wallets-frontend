import { useState } from "react";
import { apiFetch } from "@/lib/http";
import { exportTransactionsFromData, exportAllTransactions } from "@/lib/exports";
import { toast } from "@/hooks/use-toast";

type ExportFormat = "pdf" | "xlsx";

export function useTransactionExport({ filtersPack, rawItems }: { filtersPack: any; rawItems: any[] }) {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exporting, setExporting] = useState<false | ExportFormat>(false);
  const [exportAll, setExportAll] = useState(false);

  const runExport = async (format: ExportFormat) => {
    try {
      setExporting(format);
      if (exportAll) {
        await exportAllTransactions({ format, includeInStats: true, filters: filtersPack });
      } else {
        const [rawAccounts, rawCategories] = await Promise.all([
          apiFetch<any[]>(`accounts`).catch(() => []),
          apiFetch<any[]>(`categories`).catch(() => []),
        ]);
        await exportTransactionsFromData({
          format,
          data: { items: rawItems, accounts: rawAccounts, categories: rawCategories, title: "Mis movimientos", createdBy: undefined },
        });
      }
      toast({ title: "Export ready", description: `Your ${format === 'pdf' ? 'PDF' : 'Excel'} download has started.` });
      setIsExportOpen(false);
    } catch (err: any) {
      toast({ title: "Export failed", description: String(err?.message || err) });
    } finally {
      setExporting(false);
    }
  };

  return { isExportOpen, setIsExportOpen, exporting, exportAll, setExportAll, runExport };
}
