import { AlertTriangle, ArrowDownCircle, ArrowUpCircle, HandCoins, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DebtType } from "@/lib/types";

export function QuickActionMenu({
  onCreateSubscription,
  onCreateDebt,
}: {
  onCreateSubscription: (type: "gasto" | "ingreso") => void;
  onCreateDebt: (type: DebtType) => void;
}) {
  const { t } = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40">
          <Plus className="h-6 w-6" />
          <span className="sr-only">{t("calendar.quickAction.srLabel")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuItem className="flex items-center gap-2" onClick={() => onCreateSubscription("gasto")}>
          <ArrowDownCircle className="h-4 w-4 text-red-600" />
          {t("calendar.quickAction.newExpense")}
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2" onClick={() => onCreateSubscription("ingreso")}>
          <ArrowUpCircle className="h-4 w-4 text-emerald-600" />
          {t("calendar.quickAction.newIncome")}
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2" onClick={() => onCreateDebt("payable")}>
          <AlertTriangle className="h-4 w-4 text-red-600" />
          {t("calendar.quickAction.newDebtPayable")}
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2" onClick={() => onCreateDebt("receivable")}>
          <HandCoins className="h-4 w-4 text-emerald-600" />
          {t("calendar.quickAction.newDebtReceivable")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
