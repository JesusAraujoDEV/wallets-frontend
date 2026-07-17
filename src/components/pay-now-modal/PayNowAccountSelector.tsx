import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Account } from "@/lib/types";

export function PayNowAccountSelector({
  accounts, selectedAccountId, setSelectedAccountId,
}: {
  accounts: Account[];
  selectedAccountId: string;
  setSelectedAccountId: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>Cuenta de origen</Label>
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
        <p className="text-xs text-muted-foreground">
          Selecciona una cuenta para continuar.
        </p>
      )}
    </div>
  );
}
