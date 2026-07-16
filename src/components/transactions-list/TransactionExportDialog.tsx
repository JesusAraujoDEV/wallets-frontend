import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export function TransactionExportDialog({ open, onOpenChange, exportAll, setExportAll, exporting, onExport }: {
  open: boolean; onOpenChange: (open: boolean) => void;
  exportAll: boolean; setExportAll: (v: boolean) => void;
  exporting: false | "pdf" | "xlsx"; onExport: (format: "pdf" | "xlsx") => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg mx-auto max-h-[85vh] overflow-y-auto rounded-xl">
        <DialogHeader><DialogTitle>Export Transfers</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Choose a format to download your transactions.</p>
          <div className="flex items-center gap-2">
            <input id="export-all" type="checkbox" checked={exportAll} onChange={(e) => setExportAll(e.target.checked)} />
            <Label htmlFor="export-all" className="text-sm">Export ALL transactions (server-side) instead of only the loaded items</Label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button type="button" className="w-full" disabled={exporting === "pdf"} aria-busy={exporting === "pdf"} onClick={() => onExport("pdf")}>
              {exporting === "pdf" ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />PDF</>) : "PDF"}
            </Button>
            <Button type="button" variant="secondary" className="w-full" disabled={exporting === "xlsx"} aria-busy={exporting === "xlsx"} onClick={() => onExport("xlsx")}>
              {exporting === "xlsx" ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Excel</>) : "Excel"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Nota: si marcas "Export ALL", se descargan todas las transacciones (vía servidor) respetando filtros. Si no, solo las cargadas actualmente.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
