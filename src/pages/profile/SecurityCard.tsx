import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SecurityCard({ onChangePassword }: { onChangePassword: () => void }) {
  const { t } = useTranslation();
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle>{t("auth.securityCard.title")}</CardTitle>
        <CardDescription>{t("auth.securityCard.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button type="button" variant="outline" onClick={onChangePassword}>
          {t("auth.changePassword.submit")}
        </Button>
      </CardContent>
    </Card>
  );
}
