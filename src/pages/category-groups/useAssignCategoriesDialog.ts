import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import type { Category, CategoryGroup } from "@/lib/types";
import { CategoriesStore } from "@/lib/storage";
import { mapGroupTypeToCategoryType } from "./types";

export function useAssignCategoriesDialog() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assigningGroup, setAssigningGroup] = useState<CategoryGroup | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  const selectedCategoryType = assigningGroup ? mapGroupTypeToCategoryType(assigningGroup.type) : null;
  const filteredCategories = categories.filter(
    (category) => selectedCategoryType !== null && category.type === selectedCategoryType,
  );

  const closeAssignDialog = () => {
    setAssignDialogOpen(false);
    setAssigningGroup(null);
    setSelectedCategoryIds([]);
  };

  const openAssignDialog = async (group: CategoryGroup) => {
    setAssigningGroup(group);
    setAssignDialogOpen(true);
    try {
      setLoadingCategories(true);
      await CategoriesStore.refresh();
      const list = CategoriesStore.all();
      setCategories(list);
      const categoryType = mapGroupTypeToCategoryType(group.type);
      const filteredList = list.filter((category) => categoryType !== null && category.type === categoryType);
      const initialSelection = filteredList
        .filter((category) => Number(category.groupId) === group.id)
        .map((category) => Number(category.id));
      setSelectedCategoryIds(initialSelection);
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudieron cargar las categorías: ${String(error)}`,
        variant: "destructive",
      });
    } finally {
      setLoadingCategories(false);
    }
  };

  const toggleCategorySelection = (categoryId: number, checked: boolean) => {
    setSelectedCategoryIds((prev) => {
      if (checked) {
        if (prev.includes(categoryId)) return prev;
        return [...prev, categoryId];
      }
      return prev.filter((id) => id !== categoryId);
    });
  };

  return {
    assignDialogOpen,
    assigningGroup,
    selectedCategoryIds,
    loadingCategories,
    filteredCategories,
    openAssignDialog,
    closeAssignDialog,
    toggleCategorySelection,
  };
}
