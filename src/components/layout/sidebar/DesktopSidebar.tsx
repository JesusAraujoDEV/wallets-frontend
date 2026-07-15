import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogOut, HelpCircle } from "lucide-react";
import { SidebarNav } from "./SidebarNav";
import type { NavigationItem } from "./types";

export function DesktopSidebar({ items, pendingCount, onLogout, onHelp }: {
  items: NavigationItem[];
  pendingCount: number;
  onLogout: () => void;
  onHelp: () => void;
}) {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:fixed md:top-0 md:left-0 md:z-20 md:flex md:h-screen md:flex-col md:overflow-y-auto">
      <div className="border-b border-border px-6 py-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Platica</p>
        <div className="mt-2 flex items-center gap-2">
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          {pendingCount > 0 ? (
            <Badge variant="destructive" className="min-w-5 justify-center px-1.5 py-0 text-[10px]">
              {pendingCount}
            </Badge>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Navegación principal de tu workspace financiero.</p>
      </div>

      <div className="flex-1 px-4 py-6">
        <SidebarNav items={items} />
      </div>

      <div className="mt-auto border-t border-border p-4 space-y-2">
        <ThemeToggle />
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={onHelp}>
          <HelpCircle className="h-4 w-4" />
          Ayuda
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={onLogout}>
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  );
}
