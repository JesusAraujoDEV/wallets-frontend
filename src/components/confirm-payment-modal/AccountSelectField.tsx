import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Account } from "@/lib/types";

interface AccountSelectFieldProps {
  accounts: Account[];
  selectedAccountId: string;
  setSelectedAccountId: (id: string) => void;
}

export function AccountSelectField({ accounts, selectedAccountId, setSelectedAccountId }: AccountSelectFieldProps) {
  return (
    <div className="space-y-2">
      <Label>Cuenta de pago</Label>
      <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar cuenta" />
        </SelectTrigger>
        <SelectContent>
          {accounts.map((acc) => (
            <SelectItem key={acc.id} value={acc.id}>
              {acc.name} ({acc.currency})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!selectedAccountId && (
        <p className="text-xs text-muted-foreground">Selecciona una cuenta para continuar.</p>
      )}
    </div>
  );
}
