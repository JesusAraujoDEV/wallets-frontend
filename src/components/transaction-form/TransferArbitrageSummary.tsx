import { useTranslation } from "react-i18next";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function TransferArbitrageSummary({ bcvOfficialRate, appliedRate, baseBcvAmount, gainOrLoss, gainOrLossUsdApprox }: {
  bcvOfficialRate: number | null;
  appliedRate: number;
  baseBcvAmount: number;
  gainOrLoss: number;
  gainOrLossUsdApprox: number;
}) {
  const { t } = useTranslation();
  return (
    <Alert className="border-primary/30 bg-primary/5">
      <AlertTitle>{t("transactions.arbitrageSummaryTitle")}</AlertTitle>
      <AlertDescription className="space-y-1 text-sm break-words">
        <p>{t("transactions.officialBcvRate", { rate: bcvOfficialRate?.toFixed(4) })}</p>
        <p>{t("transactions.appliedRateLabel", { rate: appliedRate.toFixed(6) })}</p>
        <p>{t("transactions.baseBcvAmount", { amount: baseBcvAmount.toFixed(2) })}</p>
        {gainOrLoss > 0 ? (
          <p className="font-medium text-emerald-600">
            {t("transactions.arbitrageGain", { gain: gainOrLoss.toFixed(2), usd: gainOrLossUsdApprox.toFixed(2) })}
          </p>
        ) : gainOrLoss < 0 ? (
          <p className="font-medium text-red-600">{t("transactions.arbitrageLoss", { loss: gainOrLoss.toFixed(2) })}</p>
        ) : (
          <p className="font-medium text-muted-foreground">{t("transactions.arbitrageNoDiff")}</p>
        )}
      </AlertDescription>
    </Alert>
  );
}
