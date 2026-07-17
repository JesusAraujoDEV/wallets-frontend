import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { CategoriesStore, fetchCategoryGroups, onDataChange } from "@/lib/storage";
import type { Category, CategoryGroup } from "@/lib/types";

export const useCategoryManagerData = () => {
  const [categories, setCategories] = useState<Category[]>(CategoriesStore.all());
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);

  useEffect(() => {
    setCategories(CategoriesStore.all());
    const off = onDataChange(() => setCategories(CategoriesStore.all()));
    return off;
  }, []);

  useEffect(() => {
    const loadGroups = async () => {
      try {
        setGroupsLoading(true);
        const nextGroups = await fetchCategoryGroups();
        setGroups(nextGroups);
      } catch (error) {
        toast({ title: "Error", description: `Unable to load category groups: ${String(error)}`, variant: "destructive" });
      } finally {
        setGroupsLoading(false);
      }
    };
    loadGroups();
  }, []);

  return { categories, groups, groupsLoading };
};
