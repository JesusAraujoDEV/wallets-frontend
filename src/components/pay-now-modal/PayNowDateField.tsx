import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PayNowDateField({
  paymentDate, setPaymentDate,
}: {
  paymentDate: string;
  setPaymentDate: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="paynow-payment-date">Fecha de pago</Label>
      <Input
        id="paynow-payment-date"
        type="date"
        value={paymentDate}
        onChange={(e) => setPaymentDate(e.target.value)}
      />
    </div>
  );
}
