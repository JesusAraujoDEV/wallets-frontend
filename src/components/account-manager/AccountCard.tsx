import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Wallet, Loader2 } from "lucide-react";
import type { Account } from "@/lib/types";
import { CURRENCY_SYMBOLS } from "./constants";

interface AccountCardProps {
  account: Account;
  vesPerUsd?: number;
  isDeleting: boolean;
  onEdit: (account: Account) => void;
  onRequestDelete: (accountId: string) => void;
}

export const AccountCard = ({ account, vesPerUsd, isDeleting, onEdit, onRequestDelete }: AccountCardProps) => {
  return (
    <Card className="p-6 shadow-md border-0 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary-light text-emerald-950">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{account.name}</h3>
            <p className="text-sm text-muted-foreground">{account.currency}</p>
          </div>
        </div>
      </div>
      <div className="mb-4">
        <p className="text-2xl font-bold text-foreground">
          {CURRENCY_SYMBOLS[account.currency]}{account.balance.toFixed(2)}
        </p>
        {account.currency === "VES" && vesPerUsd ? (
          <p className="text-xs text-muted-foreground mt-1">≈ $
            {(account.balance / vesPerUsd).toFixed(2)} USD
          </p>
        ) : null}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(account)}
          className="flex-1"
          disabled={isDeleting}
        >
          <Pencil className="w-3 h-3 mr-1" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRequestDelete(account.id)}
          className="flex-1 text-destructive hover:bg-destructive/10"
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};
