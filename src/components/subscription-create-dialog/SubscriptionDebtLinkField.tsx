import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Debt } from "@/lib/types";

export function SubscriptionDebtLinkField({
  activeDebts,
  debtId,
  onDebtChange,
  subscriptionType,
}: {
  activeDebts: Debt[];
  debtId: string;
  onDebtChange: (id: string) => void;
  subscriptionType: "gasto" | "ingreso";
}) {
  if (activeDebts.length === 0) return null;

  const eligibleDebts = activeDebts.filter((d) =>
    subscriptionType === "ingreso" ? d.type === "receivable" : d.type === "payable",
  );

  return (
    <div className="space-y-2">
      <Label>Vincular a Deuda (opcional)</Label>
      <Select value={debtId || "__none__"} onValueChange={(v) => onDebtChange(v === "__none__" ? "" : v)}>
        <SelectTrigger>
          <SelectValue placeholder="Sin deuda vinculada" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">Sin deuda vinculada</SelectItem>
          {eligibleDebts.map((d) => (
            <SelectItem key={d.id} value={d.id}>
              {d.contactName} - {d.type === "payable" ? "Por Pagar" : "Por Cobrar"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
