import type { Account } from "@/lib/types";
import type { ExchangeRate } from "@/lib/rates";
import { useDisplayCurrency, vesPerUnit, currencySymbol } from "@/lib/displayCurrency";

export function AccountOption({ account, rate }: { account: Account; rate: ExchangeRate | null | undefined }) {
  const [displayCurrency] = useDisplayCurrency();
  const perUnit = vesPerUnit(rate, displayCurrency);

  return (
    <div className="flex items-center justify-between gap-3 w-full">
      <div className="flex items-center gap-2">
        <span className="font-medium">{account.name}</span>
        <span className="text-xs text-muted-foreground">({account.currency})</span>
      </div>
      <div className="text-right">
        <div className="text-xs text-foreground/80">
          {account.currency === "USD" && "$"}
          {account.currency === "EUR" && "€"}
          {account.currency === "VES" && "Bs."}
          {account.balance.toFixed(2)}
        </div>
        {account.currency === "VES" && perUnit ? (
          <div className="text-[10px] text-muted-foreground">
            {currencySymbol(displayCurrency)}{(account.balance / perUnit).toFixed(2)} {displayCurrency}
          </div>
        ) : null}
      </div>
    </div>
  );
}
