import { NavLink } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { NavigationItem } from "./types";

export function SidebarNav({ items, onNavigate }: { items: NavigationItem[]; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-2">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.to}
            end={item.end}
            onClick={onNavigate}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-border hover:bg-accent hover:text-accent-foreground",
                isActive && "border-primary/30 bg-primary/15 text-primary",
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
            {item.badgeCount && item.badgeCount > 0 ? (
              <Badge variant="destructive" className="ml-auto min-w-5 justify-center px-1.5 py-0 text-[10px]">
                {item.badgeCount}
              </Badge>
            ) : null}
          </NavLink>
        );
      })}
    </nav>
  );
}
