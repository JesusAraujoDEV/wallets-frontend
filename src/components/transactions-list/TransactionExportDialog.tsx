import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export function TransactionExportDialog({ open, onOpenChange, exportAll, setExportAll, exporting, onExport }: {
  open: boolean; onOpenChange: (open: boolean) => void;
  exportAll: boolean; setExportAll: (v: boolean) => void;
  exporting: false | "pdf" | "xlsx"; onExport: (format: "pdf" | "xlsx") => void;
}) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg mx-auto max-h-[85vh] overflow-y-auto rounded-xl">
        <DialogHeader><DialogTitle>{t("transactions.exportTransfersTitle")}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{t("transactions.exportChooseFormat")}</p>
          <div className="flex items-center gap-2">
            <input id="export-all" type="checkbox" checked={exportAll} onChange={(e) => setExportAll(e.target.checked)} />
            <Label htmlFor="export-all" className="text-sm">{t("transactions.exportAllLabel")}</Label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button type="button" className="w-full" disabled={exporting === "pdf"} aria-busy={exporting === "pdf"} onClick={() => onExport("pdf")}>
              {exporting === "pdf" ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("transactions.exportPdf")}</>) : t("transactions.exportPdf")}
            </Button>
            <Button type="button" variant="secondary" className="w-full" disabled={exporting === "xlsx"} aria-busy={exporting === "xlsx"} onClick={() => onExport("xlsx")}>
              {exporting === "xlsx" ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("transactions.exportExcel")}</>) : t("transactions.exportExcel")}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{t("transactions.exportNote")}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
