import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { CategoriesStore, fetchCategoryGroups, newId } from "@/lib/storage";
import type { Category, CategoryGroup } from "@/lib/types";
import { CategoryEditorDialog, type CategoryEditorValue } from "@/components/CategoryEditorDialog";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCategory: Category) => void;
  defaultType?: "income" | "expense";
}

export function CategoryFormModal({ isOpen, onClose, onSuccess, defaultType }: CategoryFormModalProps) {
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CategoryEditorValue>({
    name: "",
    type: defaultType ?? "expense",
    groupId: "",
    color: "hsl(var(--chart-6))",
    colorName: "Sky Blue",
    icon: null,
  });

  // Sync defaultType when it changes (e.g. user switches Income/Expense tab)
  useEffect(() => {
    if (defaultType) {
      setFormData((prev) => ({ ...prev, type: defaultType }));
    }
  }, [defaultType]);

  useEffect(() => {
    if (!isOpen) return;
    const loadGroups = async () => {
      try {
        setGroupsLoading(true);
        const fetched = await fetchCategoryGroups();
        setGroups(fetched);
      } catch (error) {
        toast({ title: "Error", description: `Unable to load category groups: ${String(error)}`, variant: "destructive" });
      } finally {
        setGroupsLoading(false);
      }
    };
    loadGroups();
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      name: "",
      type: defaultType ?? "expense",
      groupId: "",
      color: "hsl(var(--chart-6))",
      colorName: "Sky Blue",
      icon: null,
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Nombre requerido", description: "Ingresa un nombre para la categoría.", variant: "destructive" });
      return;
    }
    if (!formData.color) return;

    try {
      setSubmitting(true);
      const tempId = newId();
      const newCategory: Category = {
        id: tempId,
        name: formData.name,
        type: formData.type,
        color: formData.color,
        colorName: formData.colorName,
        icon: formData.icon ?? null,
        ...(formData.groupId ? { groupId: Number(formData.groupId) } : { groupId: null }),
      };
      await CategoriesStore.upsert(newCategory);

      // Find the persisted category (server may assign a real id)
      const created = CategoriesStore.all().find(
        (c) => c.name.toLowerCase() === formData.name.trim().toLowerCase() && c.type === formData.type,
      );

      toast({ title: "Categoría creada", description: `${formData.name} agregada exitosamente.` });
      resetForm();
      onSuccess(created ?? newCategory);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CategoryEditorDialog
      open={isOpen}
      onOpenChange={handleOpenChange}
      value={formData}
      onChange={setFormData}
      onSubmit={handleSubmit}
      submitting={submitting}
      title="Crear Nueva Categoría"
      description="Agrega una nueva categoría para organizar tus transacciones."
      groups={groups}
      groupsLoading={groupsLoading}
    />
  );
}
