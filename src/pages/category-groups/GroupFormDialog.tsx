import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CategoryGroup } from "@/lib/types";
import type { GroupForm } from "./types";

export function GroupFormDialog({ open, onOpenChange, editingGroup, form, setForm, saving, onSubmit, onCancel }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingGroup: CategoryGroup | null;
  form: GroupForm;
  setForm: (updater: (prev: GroupForm) => GroupForm) => void;
  saving: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg mx-auto max-h-[85vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>{editingGroup ? "Editar Grupo" : "Crear Grupo"}</DialogTitle>
          <DialogDescription>
            {editingGroup
              ? "Actualiza el nombre, tipo y comportamiento analítico del grupo."
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
            <Label htmlFor="group-type">Tipo</Label>
            <Select
              value={form.type}
              onValueChange={(value: "ingreso" | "gasto" | "neutral") => setForm((prev) => ({ ...prev, type: value }))}
            >
              <SelectTrigger id="group-type">
                <SelectValue placeholder="Selecciona tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ingreso">Ingreso</SelectItem>
                <SelectItem value="gasto">Gasto</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="group-analytics">Comportamiento en estadísticas</Label>
            <Select
              value={form.analyticsBehavior}
              onValueChange={(value: "include" | "exclude") => setForm((prev) => ({ ...prev, analyticsBehavior: value }))}
            >
              <SelectTrigger id="group-analytics">
                <SelectValue placeholder="Selecciona comportamiento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="include">Incluir en estadísticas</SelectItem>
                <SelectItem value="exclude">Excluir de estadísticas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={saving}>Cancelar</Button>
          <Button onClick={onSubmit} disabled={saving} aria-busy={saving}>
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
  );
}
