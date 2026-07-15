import {
  CalendarDays,
  LayoutDashboard,
  Layers,
  Handshake,
  PiggyBank,
  Repeat,
  ReceiptText,
  Tags,
  TrendingUp,
  UserCircle2,
  WalletCards,
} from "lucide-react";
import type { NavigationItem } from "./types";

export function buildNavigationItems(pendingCount: number): NavigationItem[] {
  return [
    { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/transactions", label: "Transacciones", icon: ReceiptText },
    { to: "/subscriptions", label: "Suscripciones", icon: Repeat, badgeCount: pendingCount },
    { to: "/budgets", label: "Presupuestos", icon: PiggyBank },
    { to: "/debts", label: "Deudas", icon: Handshake },
    { to: "/rates", label: "Tasas", icon: TrendingUp },
    { to: "/calendar", label: "Calendario", icon: CalendarDays },
    { to: "/categories", label: "Categorías", icon: Tags },
    { to: "/category-groups", label: "Grupos", icon: Layers },
    { to: "/accounts", label: "Cuentas", icon: WalletCards },
    { to: "/profile", label: "Perfil", icon: UserCircle2 },
  ];
}
