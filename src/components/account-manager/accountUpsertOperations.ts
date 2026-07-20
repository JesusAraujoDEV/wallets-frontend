import { toast } from "@/hooks/use-toast";
import { AccountsStore, newId } from "@/lib/storage";
import type { Account } from "@/lib/types";
import { createBalanceAdjustmentTransaction } from "@/lib/adjustments";
import type { AccountEditorValue } from "@/components/AccountEditorDialog";

export const saveWithBalanceAdjustment = async (editingAccount: Account, formData: AccountEditorValue, nextBalance: number) => {
  const updatedMeta: Account = {
    ...editingAccount,
    name: formData.name,
    currency: formData.currency,
    balance: editingAccount.balance,
  };
  await AccountsStore.upsert(updatedMeta);
  await createBalanceAdjustmentTransaction(updatedMeta, nextBalance);
  toast({
    title: "Account Adjusted",
    description: `Se registró un ajuste para alcanzar ${nextBalance.toFixed(2)}.`,
  });
};

export const saveMetadataOnly = async (editingAccount: Account, formData: AccountEditorValue) => {
  const updated: Account = {
    ...editingAccount,
    name: formData.name,
    currency: formData.currency,
    balance: editingAccount.balance,
  };
  await AccountsStore.upsert(updated);
  await AccountsStore.refresh().catch(() => {});
  toast({
    title: "Account Updated",
    description: `${formData.name} has been updated successfully.`,
  });
};

export const createAccount = async (formData: AccountEditorValue, type = "ahorros") => {
  const newAccount: Account = {
    id: newId(),
    name: formData.name,
    currency: formData.currency,
    balance: parseFloat(formData.balance),
    type,
  };
  await AccountsStore.upsert(newAccount);
  await AccountsStore.refresh().catch(() => {});
  toast({
    title: "Account Created",
    description: `${formData.name} has been created successfully.`,
  });
};
