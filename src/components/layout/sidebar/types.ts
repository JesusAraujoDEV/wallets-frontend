import type { LayoutDashboard } from "lucide-react";

export type NavigationItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
  badgeCount?: number;
};
