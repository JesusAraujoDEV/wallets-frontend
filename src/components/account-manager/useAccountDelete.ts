import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { AccountsStore } from "@/lib/storage";

export const useAccountDelete = () => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = async (accountId: string) => {
    try {
      setDeletingId(accountId);
      await AccountsStore.remove(accountId);
      await AccountsStore.refresh().catch(() => {});
      toast({
        title: "Account Deleted",
        description: "The account has been removed.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return { deletingId, confirmDeleteId, setConfirmDeleteId, handleDelete };
};
