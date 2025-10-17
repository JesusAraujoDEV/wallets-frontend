import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Globe } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AccountsStore, onDataChange } from "@/lib/storage";
import type { Account } from "@/lib/types";


interface AccountSelectorProps {
  selectedAccount: string;
  onAccountChange: (accountId: string) => void;
}

const ALL_ACCOUNT: Account = { id: "all", name: "All Accounts", currency: "USD", balance: 0 };

export const AccountSelector = ({ selectedAccount, onAccountChange }: AccountSelectorProps) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  useEffect(() => {
    const load = () => setAccounts([ALL_ACCOUNT, ...AccountsStore.all()]);
    load();
    const off = onDataChange(load);
    return off;
  }, []);

  const options = useMemo(() => accounts, [accounts]);

  return (
    <div className="flex items-center gap-3 p-4 bg-card rounded-lg shadow-sm border border-border">
      <div className="flex items-center gap-2 text-muted-foreground">
        {selectedAccount === "all" ? (
          <Globe className="w-5 h-5" />
        ) : (
          <Building2 className="w-5 h-5" />
        )}
        <span className="text-sm font-medium">View:</span>
      </div>
      <Select value={selectedAccount} onValueChange={onAccountChange}>
        <SelectTrigger className="w-[250px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              <div className="flex items-center gap-2">
                <span className="font-medium">{account.name}</span>
                <span className="text-xs text-muted-foreground">({account.id === "all" ? "Global" : account.currency})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};