import * as Icons from "lucide-react";
import { ArrowUpCircle, ArrowDownCircle, Pencil, Trash2, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TxAmount } from "@/components/TxAmount";
import type { Account, Category, Transaction } from "@/lib/types";

export function TransactionRow({ transaction, categories, accounts, rateForDate, deletingId, onEdit, onDeleteRequest }: {
  transaction: Transaction; categories: Category[]; accounts: Account[]; rateForDate: number | null;
  deletingId: string | null; onEdit: (tx: Transaction) => void; onDeleteRequest: (id: string) => void;
}) {
  const { t } = useTranslation();
  const cat = categories.find(c => c.id === transaction.categoryId);
  const acc = accounts.find(a => a.id === transaction.accountId);
  const CatIcon = cat?.icon ? (Icons as any)[cat.icon] : null;
  const isDeleting = deletingId === transaction.id;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[auto,1fr,auto,auto] items-center gap-3 p-4 rounded-lg bg-card border border-border hover:shadow-sm transition-shadow">
      <div>
        {transaction.type === "income" ? <ArrowUpCircle className="h-8 w-8 text-emerald-500" /> : <ArrowDownCircle className="h-8 w-8 text-red-500" />}
      </div>
      <div className="min-w-0">
        <p className="text-base font-semibold text-foreground sm:truncate">{transaction.description}</p>
        <div className="flex items-center flex-wrap gap-2 mt-1">
          {CatIcon ? <CatIcon className="h-4 w-4" style={{ color: cat?.color || undefined }} /> : null}
          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: cat?.color || "hsl(var(--muted))" }} />
          <p className="text-sm text-muted-foreground">{cat?.name || t("transactions.uncategorized")}</p>
          {acc ? <Badge variant="secondary" className="ml-1 text-xs md:text-sm font-semibold">{acc.name} ({acc.currency})</Badge> : null}
        </div>
      </div>
      <div className="justify-self-end">
        <TxAmount transaction={transaction} accounts={accounts} rateForDate={rateForDate} />
      </div>
      <div className="flex items-center gap-2 justify-self-end">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(transaction)} disabled={isDeleting} aria-label={t("transactions.editTransaction")}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => onDeleteRequest(transaction.id)} disabled={isDeleting} aria-label={t("transactions.deleteTransaction")}>
          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
