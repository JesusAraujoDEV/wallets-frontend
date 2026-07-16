import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { WalletCards, PlusCircle } from "lucide-react";

export function EmptyDashboardState() {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto flex flex-col items-center gap-4 px-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <WalletCards className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-semibold text-foreground">{t("dashboard.emptyTitle")}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">{t("dashboard.emptyDescription")}</p>
      <Button asChild className="gap-2">
        <Link to="/accounts">
          <PlusCircle className="h-4 w-4" />
          {t("dashboard.emptyCta")}
        </Link>
      </Button>
    </div>
  );
}
