import { cn } from "@/lib/utils";
import { DISPLAY_CURRENCIES, useDisplayCurrency } from "@/lib/displayCurrency";

export function CurrencyToggle({ className }: { className?: string }) {
  const [value, setValue] = useDisplayCurrency();

  return (
    <div className={cn("inline-flex items-center rounded-lg border border-border bg-muted/40 p-1", className)}>
      {DISPLAY_CURRENCIES.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => setValue(c.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            value === c.value ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
          aria-pressed={value === c.value}
        >
          {c.symbol} {c.label}
        </button>
      ))}
    </div>
  );
}
