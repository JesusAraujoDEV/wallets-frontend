import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AccountSelector } from "@/components/AccountSelector";
import { ComparativeMoM } from "@/components/ComparativeMoM";
import { ComparativeMoMIncome } from "@/components/ComparativeMoMIncome";
import { StatisticsPeriodPicker } from "@/pages/statistics/StatisticsPeriodPicker";
import { StatisticsOverviewCards } from "@/pages/statistics/StatisticsOverviewCards";
import { useStatisticsComparison } from "@/pages/statistics/useStatisticsComparison";

export default function Statistics() {
  const { t } = useTranslation();
  const [selectedAccount, setSelectedAccount] = useState("all");
  const accountId = selectedAccount !== "all" ? selectedAccount : undefined;
  const { preset, setPreset, custom, setCustom, expense, income, loading, customIncomplete } =
    useStatisticsComparison({ accountId });

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{t("nav.statistics")}</CardTitle>
          <CardDescription>{t("statistics.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AccountSelector selectedAccount={selectedAccount} onAccountChange={setSelectedAccount} />
          <StatisticsPeriodPicker preset={preset} onPresetChange={setPreset} custom={custom} onCustomChange={setCustom} />
        </CardContent>
      </Card>

      {customIncomplete ? (
        <p className="text-sm text-muted-foreground">{t("statistics.pickBothRanges")}</p>
      ) : loading ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : (
        <>
          <StatisticsOverviewCards expense={expense} income={income} />
          <ComparativeMoM summary={expense.summary} categories={expense.categories_comparison} />
          <ComparativeMoMIncome summary={income.summary} categories={income.categories_comparison} />
        </>
      )}
    </div>
  );
}
