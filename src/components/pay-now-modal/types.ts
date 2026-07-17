import type { Account, RecurringTransaction } from "@/lib/types";

export type Currency = "USD" | "EUR" | "VES";

export interface PayNowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: RecurringTransaction | null;
  accounts: Account[];
  onConfirm: (payload: {
    accountId: number;
    amount: number;
    currency: Currency;
    date: string;
  }) => Promise<void>;
}
