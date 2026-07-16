import type { LayoutDashboard } from "lucide-react";

export type NavigationItem = {
  to: string;
  labelKey: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
  badgeCount?: number;
};
