import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LogOut, Menu, HelpCircle } from "lucide-react";
import { SidebarNav } from "./SidebarNav";
import type { NavigationItem } from "./types";

export function MobileSidebarHeader({ items, pendingCount, mobileOpen, setMobileOpen, onLogout, onHelp }: {
  items: NavigationItem[];
  pendingCount: number;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  onLogout: () => void;
  onHelp: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur md:hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Platica</p>
          <h1 className="truncate text-base font-semibold text-foreground">Panel financiero</h1>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Abrir navegación" className="relative">
              <Menu className="h-5 w-5" />
              {pendingCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                  {pendingCount}
                </span>
              ) : null}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex w-full max-w-xs flex-col border-r border-border bg-card px-0">
            <SheetHeader className="border-b border-border px-6 pb-4 text-left">
              <SheetTitle>Platica</SheetTitle>
              <SheetDescription>Navega entre dashboard, movimientos, catálogos y perfil.</SheetDescription>
            </SheetHeader>
            <div className="flex-1 px-4 py-6">
              <SidebarNav items={items} onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="border-t border-border p-4 space-y-2">
              <ThemeToggle />
              <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { setMobileOpen(false); onHelp(); }}>
                <HelpCircle className="h-4 w-4" />
                Ayuda
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2" onClick={onLogout}>
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
