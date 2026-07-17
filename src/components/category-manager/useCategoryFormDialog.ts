import { useState } from "react";
import type { Category } from "@/lib/types";
import type { CategoryEditorValue } from "@/components/CategoryEditorDialog";
import { useCategoryUpsertMutation } from "./useCategoryUpsertMutation";

const DEFAULT_FORM_DATA: CategoryEditorValue = {
  name: "",
  type: "expense",
  groupId: "",
  color: "hsl(var(--chart-6))",
  colorName: "Sky Blue",
  icon: null,
};

export const useCategoryFormDialog = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryEditorValue>(DEFAULT_FORM_DATA);

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    setFormData(DEFAULT_FORM_DATA);
  };

  const { isSubmitting, handleCreateOrUpdate } = useCategoryUpsertMutation(editingCategory, handleCloseDialog);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      groupId: String(category.groupId),
      color: category.color,
      colorName: category.colorName,
      icon: category.icon ?? null,
    });
    setIsDialogOpen(true);
  };

  return {
    isDialogOpen,
    setIsDialogOpen,
    editingCategory,
    isSubmitting,
    formData,
    setFormData,
    handleCreateOrUpdate: () => handleCreateOrUpdate(formData),
    handleEdit,
    handleCloseDialog,
  };
};
