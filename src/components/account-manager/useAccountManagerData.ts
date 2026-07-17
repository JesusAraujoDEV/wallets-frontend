import { useEffect, useState } from "react";
import { AccountsStore, onDataChange } from "@/lib/storage";
import type { Account } from "@/lib/types";
import { useVESExchangeRate } from "@/lib/rates";

export const useAccountManagerData = () => {
  const [accounts, setAccounts] = useState<Account[]>(AccountsStore.all());
  const { rate } = useVESExchangeRate();

  useEffect(() => {
    setAccounts(AccountsStore.all());
    const off = onDataChange(() => setAccounts(AccountsStore.all()));
    AccountsStore.refresh().catch(() => {});
    return off;
  }, []);

  return { accounts, rate };
};
