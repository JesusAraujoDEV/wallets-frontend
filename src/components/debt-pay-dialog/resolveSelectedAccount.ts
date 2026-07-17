import type { Account, Debt } from "@/lib/types";

export function resolveSelectedAccount(accounts: Account[], selectedAccountId: string, debt: Debt | null) {
  const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId);
  const requiresConversion = Boolean(debt && selectedAccount && selectedAccount.currency !== debt.currency);
  return { selectedAccount, requiresConversion };
}
