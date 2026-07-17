import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { CategoriesStore, newId } from "@/lib/storage";
import type { Category } from "@/lib/types";
import type { CategoryEditorValue } from "@/components/CategoryEditorDialog";

export const useCategoryUpsertMutation = (editingCategory: Category | null, onSuccess: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateOrUpdate = async (formData: CategoryEditorValue) => {
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Category name is required", variant: "destructive" });
      return;
    }
    if (!formData.color) return;

    try {
      setIsSubmitting(true);
      if (editingCategory) {
        await CategoriesStore.upsert({
          ...editingCategory,
          name: formData.name,
          type: formData.type,
          color: formData.color,
          colorName: formData.colorName,
          icon: formData.icon ?? null,
          ...(formData.groupId ? { groupId: Number(formData.groupId) } : { groupId: null }),
        });
        toast({ title: "Category Updated", description: `${formData.name} has been updated successfully.` });
      } else {
        const newCategory: Category = {
          id: newId(),
          name: formData.name,
          type: formData.type,
          color: formData.color,
          colorName: formData.colorName,
          icon: formData.icon ?? null,
          ...(formData.groupId ? { groupId: Number(formData.groupId) } : { groupId: null }),
        };
        await CategoriesStore.upsert(newCategory);
        toast({ title: "Category Created", description: `${formData.name} has been added successfully.` });
      }
      onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, handleCreateOrUpdate };
};
