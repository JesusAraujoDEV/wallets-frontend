import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import type { CategoryGroup } from "@/lib/types";
import { deleteCategoryGroup, fetchCategoryGroups } from "@/lib/storage";

export function useGroupsList() {
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const list = await fetchCategoryGroups();
      setGroups(list);
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudieron cargar los grupos: ${String(error)}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      await deleteCategoryGroup(id);
      toast({ title: "Grupo eliminado", description: "El grupo fue eliminado correctamente." });
      setConfirmDeleteId(null);
      await loadGroups();
    } catch (error) {
      toast({ title: "Error", description: `No se pudo eliminar el grupo: ${String(error)}`, variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  return { groups, loading, loadGroups, deletingId, confirmDeleteId, setConfirmDeleteId, handleDelete };
}
