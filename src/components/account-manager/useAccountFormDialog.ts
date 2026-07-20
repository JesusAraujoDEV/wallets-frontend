import { useState } from "react";
import type { Account } from "@/lib/types";
import type { AccountEditorValue } from "@/components/AccountEditorDialog";
import { useAccountUpsertMutation } from "./useAccountUpsertMutation";

const DEFAULT_FORM_DATA: AccountEditorValue = {
  name: "",
  currency: "USD",
  balance: "",
};

export const useAccountFormDialog = (newAccountType = "ahorros") => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState<AccountEditorValue>(DEFAULT_FORM_DATA);

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAccount(null);
    setFormData(DEFAULT_FORM_DATA);
  };

  const { isSubmitting, handleSubmit } = useAccountUpsertMutation(editingAccount, handleCloseDialog, newAccountType);

  const handleOpenDialog = (account?: Account) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        name: account.name,
        currency: account.currency,
        balance: account.balance.toString(),
      });
    } else {
      setEditingAccount(null);
      setFormData(DEFAULT_FORM_DATA);
    }
    setIsDialogOpen(true);
  };

  return {
    isDialogOpen,
    setIsDialogOpen,
    editingAccount,
    isSubmitting,
    formData,
    setFormData,
    handleSubmit: () => handleSubmit(formData),
    handleOpenDialog,
  };
};
