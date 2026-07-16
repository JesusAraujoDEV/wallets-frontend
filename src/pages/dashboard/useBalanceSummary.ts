import { useEffect, useState } from "react";
import { fetchGlobalBalance, type GlobalBalance } from "@/lib/summary";

export function useBalanceSummary({ monthKey, selectedAccount, selectedGroupNumber }: {
  monthKey: string;
  selectedAccount: string;
  selectedGroupNumber: number | null;
}) {
  const [balanceSummary, setBalanceSummary] = useState<GlobalBalance | null>(null);

  useEffect(() => {
    let alive = true;
    const accountIds = selectedAccount !== "all" ? [selectedAccount] : undefined;
    (async () => {
      try {
        const summary = await fetchGlobalBalance({ month: monthKey, accountIds, groupId: selectedGroupNumber ?? undefined });
        if (alive) setBalanceSummary(summary);
      } catch {
        if (alive) setBalanceSummary(null);
      }
    })();
    return () => { alive = false; };
  }, [monthKey, selectedAccount, selectedGroupNumber]);

  return balanceSummary;
}
