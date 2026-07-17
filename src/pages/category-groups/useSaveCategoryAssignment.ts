import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import type { CategoryGroup } from "@/lib/types";
import { CategoriesStore, assignCategoriesToGroup } from "@/lib/storage";

export function useSaveCategoryAssignment(onSaved: () => Promise<void>) {
  const queryClient = useQueryClient();
  const [savingAssignment, setSavingAssignment] = useState(false);

  const saveCategoryAssignment = async (
    assigningGroup: CategoryGroup | null,
    selectedCategoryIds: number[],
    closeAssignDialog: () => void,
  ) => {
    if (!assigningGroup) return;

    try {
      setSavingAssignment(true);
      await assignCategoriesToGroup(assigningGroup.id, selectedCategoryIds);
      toast({ title: "Asignación actualizada", description: "Las categorías del grupo fueron actualizadas correctamente." });
      closeAssignDialog();
      await Promise.all([onSaved(), CategoriesStore.refresh()]);
      await queryClient.invalidateQueries();
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudieron guardar las categorías del grupo: ${String(error)}`,
        variant: "destructive",
      });
    } finally {
      setSavingAssignment(false);
    }
  };

  return { savingAssignment, saveCategoryAssignment };
}
