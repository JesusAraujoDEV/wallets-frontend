import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function TransferArbitrageSummary({ bcvOfficialRate, appliedRate, baseBcvAmount, gainOrLoss, gainOrLossUsdApprox }: {
  bcvOfficialRate: number | null;
  appliedRate: number;
  baseBcvAmount: number;
  gainOrLoss: number;
  gainOrLossUsdApprox: number;
}) {
  return (
    <Alert className="border-primary/30 bg-primary/5">
      <AlertTitle>Resumen de la Jugada</AlertTitle>
      <AlertDescription className="space-y-1 text-sm break-words">
        <p>Tasa oficial BCV: {bcvOfficialRate?.toFixed(4)}</p>
        <p>Tasa tuya aplicada: {appliedRate.toFixed(6)}</p>
        <p>Monto Base BCV: {baseBcvAmount.toFixed(2)} VES</p>
        {gainOrLoss > 0 ? (
          <p className="font-medium text-emerald-600">¡Farmeando Aura! Ganancia detectada: +{gainOrLoss.toFixed(2)} VES (Aprox +{gainOrLossUsdApprox.toFixed(2)} USD)</p>
        ) : gainOrLoss < 0 ? (
          <p className="font-medium text-red-600">Pérdida cambiaria: {gainOrLoss.toFixed(2)} VES</p>
        ) : (
          <p className="font-medium text-muted-foreground">Sin diferencia cambiaria: 0.00 VES</p>
        )}
      </AlertDescription>
    </Alert>
  );
}
