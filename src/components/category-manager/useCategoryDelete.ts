import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { CategoriesStore } from "@/lib/storage";
import type { Category } from "@/lib/types";

export const useCategoryDelete = (categories: Category[]) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    try {
      setDeletingId(categoryId);
      await CategoriesStore.remove(categoryId);
      toast({ title: "Category Deleted", description: `${category?.name} has been removed.` });
    } finally {
      setDeletingId(null);
    }
  };

  return { deletingId, confirmDeleteId, setConfirmDeleteId, handleDelete };
};
