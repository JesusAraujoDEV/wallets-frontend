import {
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  Layers,
  Handshake,
  PiggyBank,
  Repeat,
  ReceiptText,
  Sprout,
  Tags,
  TrendingUp,
  UserCircle2,
  WalletCards,
} from "lucide-react";
import type { NavigationItem } from "./types";

export function buildNavigationItems(pendingCount: number): NavigationItem[] {
  return [
    { to: "/", labelKey: "nav.dashboard", icon: LayoutDashboard, end: true },
    { to: "/transactions", labelKey: "nav.transactions", icon: ReceiptText },
    { to: "/subscriptions", labelKey: "nav.subscriptions", icon: Repeat, badgeCount: pendingCount },
    { to: "/budgets", labelKey: "nav.budgets", icon: PiggyBank },
    { to: "/debts", labelKey: "nav.debts", icon: Handshake },
    { to: "/rates", labelKey: "nav.rates", icon: TrendingUp },
    { to: "/statistics", labelKey: "nav.statistics", icon: BarChart3 },
    { to: "/savings", labelKey: "nav.savings", icon: Sprout },
    { to: "/calendar", labelKey: "nav.calendar", icon: CalendarDays },
    { to: "/categories", labelKey: "nav.categories", icon: Tags },
    { to: "/category-groups", labelKey: "nav.categoryGroups", icon: Layers },
    { to: "/accounts", labelKey: "nav.accounts", icon: WalletCards },
    { to: "/profile", labelKey: "nav.profile", icon: UserCircle2 },
  ];
}
