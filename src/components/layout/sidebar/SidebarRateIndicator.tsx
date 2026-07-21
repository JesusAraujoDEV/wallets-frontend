import { useDisplayCurrency, currencySymbol, vesPerUnit, DISPLAY_CURRENCIES, setDisplayCurrency } from "@/lib/displayCurrency";
import { useCurrentExchangeRate } from "@/lib/rates";
import { TrendingUp } from "lucide-react";

export function SidebarRateIndicator() {
  const [preferred] = useDisplayCurrency();
  const { data: rate } = useCurrentExchangeRate();
  const currentRate = vesPerUnit(rate ?? null, preferred);
  const symbol = currencySymbol(preferred);
  const label = DISPLAY_CURRENCIES.find((c) => c.value === preferred)?.label ?? preferred;

  const nextCurrency = () => {
    const idx = DISPLAY_CURRENCIES.findIndex((c) => c.value === preferred);
    const next = DISPLAY_CURRENCIES[(idx + 1) % DISPLAY_CURRENCIES.length];
    setDisplayCurrency(next.value);
  };

  return (
    <button
      onClick={nextCurrency}
      className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
      title={`Tasa activa: ${label}. Click para cambiar.`}
    >
      <TrendingUp className="h-4 w-4 text-primary shrink-0" />
      <div className="flex flex-col min-w-0">
        <span className="text-xs text-muted-foreground leading-none">Tasa {label}</span>
        <span className="font-semibold text-foreground leading-tight">
          {symbol}{currentRate != null ? currentRate.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "…"}
          <span className="text-[10px] text-muted-foreground ml-1">Bs/{preferred}</span>
        </span>
      </div>
    </button>
  );
}
