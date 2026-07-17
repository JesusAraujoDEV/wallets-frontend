import type { Debt } from "@/lib/types";
import { formatCurrency } from "./types";

export interface DebtPaymentValidationError {
  title: string;
  description: string;
}

export interface DebtPaymentValidationOk {
  numAmount: number;
  calculatedRate: number | null;
}

export function validateDebtPayment({
  debt, selectedAccountId, amount, paymentDate, requiresConversion, hasValidEquivalentAmount,
  hasValidAmount, numEquivalentAmount,
}: {
  debt: Debt;
  selectedAccountId: string;
  amount: string;
  paymentDate: string;
  requiresConversion: boolean;
  hasValidEquivalentAmount: boolean;
  hasValidAmount: boolean;
  numEquivalentAmount: number;
}): DebtPaymentValidationError | DebtPaymentValidationOk {
  if (!selectedAccountId) {
    return { title: "Cuenta requerida", description: "Selecciona una cuenta para continuar." };
  }
  const numAmount = Number(amount);
  if (!amount || numAmount <= 0) {
    return { title: "Monto inválido", description: "Ingresa un monto válido." };
  }
  if (!paymentDate) {
    return { title: "Fecha requerida", description: "Selecciona la fecha del pago para continuar." };
  }
  if (numAmount > debt.remaining) {
    return {
      title: "Monto excede el saldo",
      description: `El máximo a abonar es ${formatCurrency(debt.remaining, debt.currency)}.`,
    };
  }
  if (requiresConversion && !hasValidEquivalentAmount) {
    return {
      title: "Monto debitado requerido",
      description: "Ingresa un monto a debitar válido para continuar.",
    };
  }

  const calculatedRate =
    requiresConversion && hasValidAmount && Number.isFinite(numEquivalentAmount) && numEquivalentAmount > 0
      ? numEquivalentAmount / numAmount
      : null;

  if (requiresConversion && (!calculatedRate || !Number.isFinite(calculatedRate) || calculatedRate <= 0)) {
    return {
      title: "No se pudo calcular la tasa",
      description: "Verifica los montos ingresados para continuar.",
    };
  }

  return { numAmount, calculatedRate };
}
