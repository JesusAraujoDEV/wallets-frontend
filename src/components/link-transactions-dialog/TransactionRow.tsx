import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { Debt, Transaction } from "@/lib/types";
import { fmtCurrency } from "./types";

interface TransactionRowProps {
  tx: Transaction;
  debt: Debt | null;
  isLinked: boolean;
  isChecked: boolean;
  onToggle: (id: string) => void;
}

export function TransactionRow({ tx, debt, isLinked, isChecked, onToggle }: TransactionRowProps) {
  const { t } = useTranslation();
  const txCurrency = tx.currency || debt?.currency || "USD";
  const showUsdEquiv = txCurrency !== "USD" && tx.amountUsd != null;

  return (
    <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-accent/40 transition-colors">
      <Checkbox checked={isChecked} onCheckedChange={() => onToggle(tx.id)} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate flex-1">
            {tx.description || t("transactions.noDescription")}
          </p>
          {isLinked && (
            <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5 py-0">
              {t("transactions.linked")}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{tx.date}</p>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-sm font-semibold text-foreground">
            {fmtCurrency(tx.amount, txCurrency)}
          </span>
          {showUsdEquiv && (
            <span className="text-xs text-muted-foreground">
              ≈ {fmtCurrency(tx.amountUsd!, "USD")}
            </span>
          )}
        </div>
      </div>
    </label>
  );
}
