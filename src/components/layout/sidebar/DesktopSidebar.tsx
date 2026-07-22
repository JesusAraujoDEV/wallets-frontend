import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LogOut, HelpCircle } from "lucide-react";
import { SidebarNav } from "./SidebarNav";
import { SidebarRateIndicator } from "./SidebarRateIndicator";
import type { NavigationItem } from "./types";

export function DesktopSidebar({ items, pendingCount, onLogout, onHelp }: {
  items: NavigationItem[];
  pendingCount: number;
  onLogout: () => void;
  onHelp: () => void;
}) {
  const { t } = useTranslation();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:fixed md:top-0 md:left-0 md:z-20 md:flex md:h-screen md:flex-col">
      <div className="shrink-0 border-b border-border px-6 py-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Platica</p>
        <div className="mt-2 flex items-center gap-2">
          <h1 className="text-xl font-semibold text-foreground">{t("nav.dashboard")}</h1>
          {pendingCount > 0 ? (
            <Badge variant="destructive" className="min-w-5 justify-center px-1.5 py-0 text-[10px]">
              {pendingCount}
            </Badge>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{t("sidebar.tagline")}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <SidebarNav items={items} />
      </div>

      <div className="shrink-0 border-t border-border p-4 space-y-2">
        <SidebarRateIndicator />
        <LanguageSwitcher className="w-full" />
        <ThemeToggle />
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={onHelp}>
          <HelpCircle className="h-4 w-4" />
          {t("common.help")}
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={onLogout}>
          <LogOut className="h-4 w-4" />
          {t("common.logout")}
        </Button>
      </div>
    </aside>
  );
}
