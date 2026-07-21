import { useTranslation } from "react-i18next";
import { CategoryManager } from "@/components/CategoryManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Categories() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-card-foreground">{t("categories.title")}</CardTitle>
          <CardDescription>
            {t("categories.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryManager />
        </CardContent>
      </Card>
    </div>
  );
}
