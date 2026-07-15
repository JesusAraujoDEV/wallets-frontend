import { LayoutDashboard, WalletCards, ArrowLeftRight, TrendingUp, PiggyBank, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export type OnboardingStep = {
  icon: ReactNode;
  title: string;
  description: string;
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    icon: <Sparkles className="h-8 w-8" />,
    title: "¡Bienvenido a Platica!",
    description: "Tu tracker financiero personal. En un minuto te mostramos dónde está todo — puedes saltarte esto cuando quieras.",
  },
  {
    icon: <WalletCards className="h-8 w-8" />,
    title: "Cuentas",
    description: "Registra tus cuentas en USD, EUR o VES. Cada una lleva su propio balance, y Platica calcula el equivalente entre monedas por ti.",
  },
  {
    icon: <ArrowLeftRight className="h-8 w-8" />,
    title: "Transacciones y transferencias",
    description: "Agrega ingresos, gastos y transferencias entre cuentas desde el botón \"Nueva transacción\". Las transferencias entre monedas usan la tasa BCV del día automáticamente.",
  },
  {
    icon: <TrendingUp className="h-8 w-8" />,
    title: "Tasas de cambio",
    description: "La sección \"Tasas\" muestra el histórico oficial de USD, EUR y USDT. Elige en qué moneda quieres ver tus equivalencias con el selector $ / € / USDT.",
  },
  {
    icon: <PiggyBank className="h-8 w-8" />,
    title: "Presupuestos y deudas",
    description: "Define presupuestos por categoría y lleva el control de deudas por cobrar o pagar — todo se refleja en tu Dashboard.",
  },
  {
    icon: <LayoutDashboard className="h-8 w-8" />,
    title: "Listo para empezar",
    description: "El Dashboard resume todo: flujo de caja, gastos por categoría y tendencias. Puedes volver a ver este recorrido con el botón \"?\" del menú, cuando quieras.",
  },
];
