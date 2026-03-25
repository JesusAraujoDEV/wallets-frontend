import { useEffect, useState } from "react";
import { Layers, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import type { CategoryGroup, CategoryGroupUpsertPayload } from "@/lib/types";
import { createCategoryGroup, deleteCategoryGroup, fetchCategoryGroups, updateCategoryGroup } from "@/lib/storage";

type GroupForm = {
  name: string;
  description: string;
};

const emptyForm: GroupForm = {
  name: "",
  description: "",
};

export default function CategoryGroups() {
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CategoryGroup | null>(null);
  const [form, setForm] = useState<GroupForm>(emptyForm);

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

  const openCreateDialog = () => {
    setEditingGroup(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (group: CategoryGroup) => {
    setEditingGroup(group);
    setForm({
      name: group.name,
      description: group.description ?? "",
    });
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
      description: form.description.trim() ? form.description.trim() : null,
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
      await loadGroups();
    } catch (error) {
      toast({ title: "Error", description: `No se pudo guardar el grupo: ${String(error)}`, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-2xl text-slate-950">
                <Layers className="h-6 w-6" />
                Grupos de Categorías
              </CardTitle>
              <CardDescription>
                Gestiona los grupos para organizar y filtrar categorías en todo el dashboard.
              </CardDescription>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full gap-2 sm:w-auto" onClick={openCreateDialog}>
                  <Plus className="h-4 w-4" />
                  Nuevo Grupo
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md sm:max-w-lg mx-auto max-h-[85vh] overflow-y-auto rounded-xl">
                <DialogHeader>
                  <DialogTitle>{editingGroup ? "Editar Grupo" : "Crear Grupo"}</DialogTitle>
                  <DialogDescription>
                    {editingGroup
                      ? "Actualiza el nombre y la descripción del grupo."
                      : "Crea un grupo para clasificar categorías y usarlo como filtro global."}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="group-name">Nombre</Label>
                    <Input
                      id="group-name"
                      placeholder="Ej. Gastos fijos"
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="group-description">Descripción (opcional)</Label>
                    <Input
                      id="group-description"
                      placeholder="Ej. Servicios, renta y suscripciones"
                      value={form.description}
                      onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={closeDialog} disabled={saving}>Cancelar</Button>
                  <Button onClick={submitGroup} disabled={saving} aria-busy={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando grupos...
            </div>
          ) : groups.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
              No hay grupos creados. Agrega tu primer grupo para empezar.
            </div>
          ) : (
            <div className="space-y-3">
              {groups.map((group) => (
                <div key={group.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">{group.name}</p>
                    <p className="text-sm text-slate-500">{group.description || "Sin descripción"}</p>
                  </div>
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:gap-3">
                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => openEditDialog(group)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full sm:w-auto"
                      onClick={() => setConfirmDeleteId(group.id)}
                      disabled={deletingId === group.id}
                    >
                      {deletingId === group.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={confirmDeleteId !== null} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar grupo</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El grupo dejará de estar disponible para nuevas categorías.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingId !== null}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={confirmDeleteId === null || deletingId !== null}
              onClick={() => {
                if (confirmDeleteId === null) return;
                handleDelete(confirmDeleteId);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
