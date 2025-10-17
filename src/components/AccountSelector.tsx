import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Globe } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AccountsStore, onDataChange } from "@/lib/storage";
import { useVESExchangeRate, convertToUSD } from "@/lib/rates";
import type { Account } from "@/lib/types";


interface AccountSelectorProps {
  selectedAccount: string;
  onAccountChange: (accountId: string) => void;
}

const ALL_ACCOUNT: Account = { id: "all", name: "All Accounts", currency: "USD", balance: 0 };

export const AccountSelector = ({ selectedAccount, onAccountChange }: AccountSelectorProps) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const { rate } = useVESExchangeRate();
  useEffect(() => {
    const load = () => {
      const userAccounts = AccountsStore.all();
      setAccounts((prev) => {
        // Compute USD total using rate if available
        const usdTotal = userAccounts.reduce((sum, a) => {
          const usd = convertToUSD(a.balance || 0, a.currency, rate || null);
          return sum + (usd ?? 0);
        }, 0);
        return [{ ...ALL_ACCOUNT, balance: Number(usdTotal.toFixed(2)) }, ...userAccounts];
      });
    };
    load();
    const off = onDataChange(load);
    return off;
  }, [rate]);

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
              <div className="flex items-center justify-between gap-3 w-full">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{account.name}</span>
                  <span className="text-xs text-muted-foreground">({account.id === "all" ? "Global (USD)" : account.currency})</span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-foreground/80">
                    {account.id === "all"
                      ? "$"
                      : account.currency === "USD" ? "$" : account.currency === "EUR" ? "€" : "Bs."}
                    {account.balance.toFixed(2)}
                  </div>
                  {account.currency === "VES" && rate?.vesPerUsd ? (
                    <div className="text-[10px] text-muted-foreground">$
                      {(account.balance / rate.vesPerUsd).toFixed(2)} USD
                    </div>
                  ) : null}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};