import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Globe } from "lucide-react";

interface Account {
  id: string;
  name: string;
  currency: string;
}

interface AccountSelectorProps {
  selectedAccount: string;
  onAccountChange: (accountId: string) => void;
}

const mockAccounts: Account[] = [
  { id: "all", name: "All Accounts", currency: "Global" },
  { id: "1", name: "Checking Account", currency: "USD" },
  { id: "2", name: "Savings Account", currency: "USD" },
  { id: "3", name: "Cash Wallet", currency: "EUR" },
];

export const AccountSelector = ({ selectedAccount, onAccountChange }: AccountSelectorProps) => {
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
          {mockAccounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              <div className="flex items-center gap-2">
                <span className="font-medium">{account.name}</span>
                <span className="text-xs text-muted-foreground">({account.currency})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};