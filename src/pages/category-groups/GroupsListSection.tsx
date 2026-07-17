import { Layers, Loader2, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CategoryGroup } from "@/lib/types";
import { GroupRow } from "./GroupRow";

export function GroupsListSection({ groups, loading, deletingId, onCreate, onAssign, onEdit, onDelete }: {
  groups: CategoryGroup[];
  loading: boolean;
  deletingId: number | null;
  onCreate: () => void;
  onAssign: (group: CategoryGroup) => void;
  onEdit: (group: CategoryGroup) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-2xl text-card-foreground">
              <Layers className="h-6 w-6" />
              Grupos de Categorías
            </CardTitle>
            <CardDescription>
              Gestiona los grupos para organizar y filtrar categorías en todo el dashboard.
            </CardDescription>
          </div>
          <Button className="w-full gap-2 sm:w-auto" onClick={onCreate}>
            <Plus className="h-4 w-4" />
            Nuevo Grupo
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando grupos...
          </div>
        ) : groups.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No hay grupos creados. Agrega tu primer grupo para empezar.
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => (
              <GroupRow
                key={group.id}
                group={group}
                isDeleting={deletingId === group.id}
                onAssign={() => onAssign(group)}
                onEdit={() => onEdit(group)}
                onDelete={() => onDelete(group.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
