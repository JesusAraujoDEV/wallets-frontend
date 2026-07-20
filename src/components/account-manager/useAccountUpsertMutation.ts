import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import type { Account } from "@/lib/types";
import type { AccountEditorValue } from "@/components/AccountEditorDialog";
import { saveWithBalanceAdjustment, saveMetadataOnly, createAccount } from "./accountUpsertOperations";

export const useAccountUpsertMutation = (editingAccount: Account | null, onSuccess: () => void, newAccountType = "ahorros") => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: AccountEditorValue) => {
    if (!formData.name || !formData.balance) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingAccount) {
        const nextBalance = parseFloat(formData.balance);
        const changedBalance = isFinite(nextBalance) && nextBalance !== editingAccount.balance;
        if (changedBalance) {
          await saveWithBalanceAdjustment(editingAccount, formData, nextBalance);
        } else {
          await saveMetadataOnly(editingAccount, formData);
        }
      } else {
        await createAccount(formData, newAccountType);
      }
      onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, handleSubmit };
};
