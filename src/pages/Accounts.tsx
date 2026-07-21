import { useTranslation } from "react-i18next";
import { AccountManager } from "@/components/AccountManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Accounts() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-card-foreground">{t("accounts.title")}</CardTitle>
          <CardDescription>
            {t("accounts.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AccountManager />
        </CardContent>
      </Card>
    </div>
  );
}
