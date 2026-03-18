import { Button } from "@/components/ui/button";
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
  LayoutDashboard,
  Menu,
  ReceiptText,
  Tags,
  UserCircle2,
  WalletCards,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

type NavigationItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
};

const navigationItems: NavigationItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/transactions", label: "Transacciones", icon: ReceiptText },
  { to: "/categories", label: "Categorías", icon: Tags },
  { to: "/accounts", label: "Cuentas", icon: WalletCards },
  { to: "/profile", label: "Perfil", icon: UserCircle2 },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-2">
      {navigationItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.to}
            end={item.end}
            onClick={onNavigate}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm font-medium text-slate-600 transition-colors hover:border-slate-200 hover:bg-slate-100 hover:text-slate-950",
                isActive && "border-emerald-100 bg-emerald-50 text-emerald-700",
              )
            }
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export default function SidebarLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 md:h-screen md:overflow-hidden">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Platica</p>
            <h1 className="truncate text-base font-semibold text-slate-950">Panel financiero</h1>
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Abrir navegación">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-xs border-r border-slate-200 bg-white px-0">
              <SheetHeader className="border-b border-slate-200 px-6 pb-4 text-left">
                <SheetTitle>Platica</SheetTitle>
                <SheetDescription>Navega entre dashboard, movimientos, catálogos y perfil.</SheetDescription>
              </SheetHeader>
              <div className="px-4 py-6">
                <SidebarNav onNavigate={() => setMobileOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="flex min-h-screen w-full md:h-screen md:flex-row md:overflow-hidden">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white md:fixed md:top-0 md:left-0 md:z-20 md:flex md:h-screen md:flex-col md:overflow-y-auto">
          <div className="border-b border-slate-200 px-6 py-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Platica</p>
            <h1 className="mt-2 text-xl font-semibold text-slate-950">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">Navegación principal de tu workspace financiero.</p>
          </div>

          <div className="flex-1 px-4 py-6">
            <SidebarNav />
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-4 md:ml-64 md:h-screen md:overflow-y-auto md:overflow-x-hidden md:px-6 md:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}