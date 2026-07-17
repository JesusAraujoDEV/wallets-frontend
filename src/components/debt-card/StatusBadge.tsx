import { Badge } from "@/components/ui/badge";
import type { Debt } from "@/lib/types";

export function StatusBadge({ status }: { status: Debt["status"] }) {
  switch (status) {
    case "paid":
      return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">Pagada</Badge>;
    case "partial":
      return <Badge className="bg-amber-500 hover:bg-amber-600 text-white">Parcial</Badge>;
    default:
      return <Badge variant="destructive">Pendiente</Badge>;
  }
}
