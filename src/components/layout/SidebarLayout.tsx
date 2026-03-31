import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthApi } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { fetchPendingTransactions, PENDING_TRANSACTIONS_QUERY_KEY } from "@/lib/subscriptions";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  Handshake,
  PiggyBank,
  Repeat,
  ReceiptText,
  Tags,
  UserCircle2,
  WalletCards,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

type NavigationItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
  badgeCount?: number;
};

function SidebarNav({ items, onNavigate }: { items: NavigationItem[]; onNavigate?: () => void }) {
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

export default function SidebarLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const pendingQuery = useQuery({
    queryKey: PENDING_TRANSACTIONS_QUERY_KEY,
    queryFn: fetchPendingTransactions,
    staleTime: 30_000,
  });
  const pendingCount = pendingQuery.data?.length ?? 0;

  const navigationItems: NavigationItem[] = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/transactions", label: "Transacciones", icon: ReceiptText },
    { to: "/subscriptions", label: "Suscripciones", icon: Repeat, badgeCount: pendingCount },
    { to: "/budgets", label: "Presupuestos", icon: PiggyBank },
    { to: "/debts", label: "Deudas", icon: Handshake },
    { to: "/calendar", label: "Calendario", icon: CalendarDays },
    { to: "/categories", label: "Categorías", icon: Tags },
    { to: "/category-groups", label: "Grupos", icon: Layers },
    { to: "/accounts", label: "Cuentas", icon: WalletCards },
    { to: "/profile", label: "Perfil", icon: UserCircle2 },
  ];

  const handleLogout = async () => {
    await AuthApi.logout();
    setMobileOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background md:h-screen md:overflow-hidden">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Platica</p>
            <h1 className="truncate text-base font-semibold text-foreground">Panel financiero</h1>
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Abrir navegación">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-full max-w-xs flex-col border-r border-border bg-card px-0">
              <SheetHeader className="border-b border-border px-6 pb-4 text-left">
                <SheetTitle>Platica</SheetTitle>
                <SheetDescription>Navega entre dashboard, movimientos, catálogos y perfil.</SheetDescription>
              </SheetHeader>
              <div className="flex-1 px-4 py-6">
                <SidebarNav items={navigationItems} onNavigate={() => setMobileOpen(false)} />
              </div>
              <div className="border-t border-border p-4 space-y-2">
                <ThemeToggle />
                <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="flex h-screen w-full overflow-hidden overflow-x-hidden bg-background md:flex-row">
        <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:fixed md:top-0 md:left-0 md:z-20 md:flex md:h-screen md:flex-col md:overflow-y-auto">
          <div className="border-b border-border px-6 py-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Platica</p>
            <h1 className="mt-2 text-xl font-semibold text-foreground">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Navegación principal de tu workspace financiero.</p>
          </div>

          <div className="flex-1 px-4 py-6">
            <SidebarNav items={navigationItems} />
          </div>

          <div className="mt-auto border-t border-border p-4 space-y-2">
            <ThemeToggle />
            <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-4 md:ml-64 md:h-screen md:overflow-y-auto md:px-6 md:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}