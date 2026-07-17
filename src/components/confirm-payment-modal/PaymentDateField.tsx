import { Label } from "@/components/ui/label";
import { UniversalDatePicker } from "@/components/UniversalDatePicker";

interface PaymentDateFieldProps {
  paymentDate: string;
  setPaymentDate: (date: string) => void;
}

export function PaymentDateField({ paymentDate, setPaymentDate }: PaymentDateFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="confirm-payment-date">Fecha real de pago</Label>
      <UniversalDatePicker
        id="confirm-payment-date"
        value={paymentDate}
        onChange={(date) => setPaymentDate(date)}
        placeholder="Seleccionar fecha real"
      />
    </div>
  );
}
