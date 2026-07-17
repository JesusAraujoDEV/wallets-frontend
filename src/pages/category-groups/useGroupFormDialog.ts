import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import type { CategoryGroup, CategoryGroupUpsertPayload } from "@/lib/types";
import { createCategoryGroup, updateCategoryGroup } from "@/lib/storage";
import { emptyForm, type GroupForm } from "./types";

export function useGroupFormDialog(onSaved: () => Promise<void>) {
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CategoryGroup | null>(null);
  const [form, setForm] = useState<GroupForm>(emptyForm);

  const openCreateDialog = () => {
    setEditingGroup(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (group: CategoryGroup) => {
    setEditingGroup(group);
    setForm({ name: group.name, type: group.type, analyticsBehavior: group.analyticsBehavior });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingGroup(null);
    setForm(emptyForm);
  };

  const submitGroup = async () => {
    if (!form.name.trim()) {
      toast({ title: "Error", description: "El nombre del grupo es obligatorio.", variant: "destructive" });
      return;
    }

    const payload: CategoryGroupUpsertPayload = {
      name: form.name.trim(),
      type: form.type,
      analyticsBehavior: form.analyticsBehavior,
    };

    try {
      setSaving(true);
      if (editingGroup) {
        await updateCategoryGroup(editingGroup.id, payload);
        toast({ title: "Grupo actualizado", description: `${payload.name} fue actualizado correctamente.` });
      } else {
        await createCategoryGroup(payload);
        toast({ title: "Grupo creado", description: `${payload.name} fue creado correctamente.` });
      }
      closeDialog();
      await onSaved();
    } catch (error) {
      toast({ title: "Error", description: `No se pudo guardar el grupo: ${String(error)}`, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return { saving, dialogOpen, setDialogOpen, editingGroup, form, setForm, openCreateDialog, openEditDialog, closeDialog, submitGroup };
}
