import { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { CategoriesStore, fetchCategoryGroups, newId } from "@/lib/storage";
import type { Category, CategoryGroup } from "@/lib/types";
import { cn, isBalanceAdjustmentCategory } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getIconOptionsForType } from "@/lib/categoryIcons";
import { CategoryIcon } from "@/components/CategoryIcon";

interface CategorySelectorProps {
  value: string;
  onChange: (categoryId: string) => void;
  filterType?: "income" | "expense";
  categories: Category[];
  className?: string;
}

export function CategorySelector({ value, onChange, filterType, categories, className }: CategorySelectorProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [pickerType, setPickerType] = useState<"income" | "expense">(filterType ?? "expense");
  const [newCatName, setNewCatName] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);
  const [newCatColor, setNewCatColor] = useState("hsl(var(--chart-6))");
  const [newCatColorName, setNewCatColorName] = useState("Sky Blue");
  const [newCatIcon, setNewCatIcon] = useState<string | null>(null);
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [categoryGroupsLoading, setCategoryGroupsLoading] = useState(false);
  const [newCatGroupId, setNewCatGroupId] = useState("");

  const ICON_OPTIONS = getIconOptionsForType(pickerType);

  const pickerFilteredCategories = categories
    .filter((c) => c.type === pickerType)
    .filter((c) => !isBalanceAdjustmentCategory(c.name));

  const selectedCategory = categories.find((c) => c.id === value) ?? null;

  const resetForm = () => {
    setNewCatName("");
    setNewCatColor("hsl(var(--chart-6))");
    setNewCatColorName("Sky Blue");
    setNewCatIcon(null);
    setNewCatGroupId("");
  };

  useEffect(() => {
    const loadGroups = async () => {
      try {
        setCategoryGroupsLoading(true);
        const groups = await fetchCategoryGroups();
        setCategoryGroups(groups);
      } catch (error) {
        toast({ title: "Error loading category groups", description: String(error), variant: "destructive" });
      } finally {
        setCategoryGroupsLoading(false);
      }
    };
    loadGroups();
  }, []);

  const handleCreateInlineCategory = async () => {
    const name = newCatName.trim();
    if (!name) {
      toast({ title: "Nombre requerido", description: "Ingresa un nombre para la categoría.", variant: "destructive" });
      return;
    }
    try {
      setCreatingCat(true);
      const tempId = newId();
      await CategoriesStore.upsert({
        id: tempId, name, type: pickerType, color: newCatColor,
        colorName: newCatColorName, icon: newCatIcon ?? undefined,
        ...(newCatGroupId && newCatGroupId !== "__none__" ? { groupId: Number(newCatGroupId) } : { groupId: null }),
      });
      const created = CategoriesStore.all().find(
        (c) => c.name.toLowerCase() === name.toLowerCase() && c.type === pickerType,
      );
      if (created) onChange(created.id);
      toast({ title: "Categoría creada", description: `${name} agregada a ${pickerType}.` });
      setModalOpen(false);
      resetForm();
    } finally {
      setCreatingCat(false);
    }
  };

  const COLOR_OPTIONS = [
    { color: "hsl(var(--chart-1))", name: "Chart 1" },
    { color: "hsl(var(--chart-2))", name: "Chart 2" },
    { color: "hsl(var(--chart-3))", name: "Chart 3" },
    { color: "hsl(var(--chart-4))", name: "Chart 4" },
    { color: "hsl(var(--chart-5))", name: "Chart 5" },
    { color: "hsl(var(--chart-6))", name: "Sky Blue" },
    { color: "hsl(var(--primary))", name: "Primary" },
    { color: "hsl(var(--secondary))", name: "Secondary" },
    { color: "hsl(var(--accent))", name: "Accent" },
    { color: "#22c55e", name: "Green" },
    { color: "#ef4444", name: "Red" },
    { color: "#f59e0b", name: "Amber" },
  ];

  return (
    <>
      <Button
        type="button"
        onClick={() => setModalOpen(true)}
        className={cn(
          "inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm ring-offset-background transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50 border border-input bg-background",
          "hover:bg-emerald-50 hover:text-emerald-900 h-10 px-4 py-2 w-full justify-start text-left font-normal",
          className,
        )}
      >
        {selectedCategory ? (
          <span className="flex items-center gap-2 w-full min-w-0">
            <CategoryIcon name={selectedCategory.icon} className="h-4 w-4 shrink-0" style={{ color: selectedCategory.color }} />
            <span className="inline-block w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: selectedCategory.color }} />
            <span className="truncate flex-1 text-left">{selectedCategory.name}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">Seleccionar categoría...</span>
        )}
      </Button>

      <Dialog
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (open && !filterType) setPickerType("expense");
          if (!open) resetForm();
        }}
      >
        <DialogContent className="w-[95vw] max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Seleccionar categoría</DialogTitle>
          </DialogHeader>

          {!filterType && (
            <Tabs value={pickerType} onValueChange={(v) => setPickerType(v as "income" | "expense")} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="expense">Gasto</TabsTrigger>
                <TabsTrigger value="income">Ingreso</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-2">
              {pickerFilteredCategories.map((cat) => {
                const selected = value === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => {
                      onChange(cat.id);
                      setModalOpen(false);
                      resetForm();
                    }}
                    className={cn(
                      "flex h-auto w-full max-w-full items-start gap-2 rounded-md border px-3 py-2 text-left text-sm",
                      selected ? "border-accent bg-accent ring-2 ring-accent/50" : "hover:bg-accent/40",
                    )}
                    title={cat.name}
                  >
                    {cat.icon && (Icons as any)[cat.icon] ? (
                      (() => {
                        const C = (Icons as any)[cat.icon!];
                        return <C className="h-5 w-5 shrink-0" style={{ color: cat.color || undefined }} />;
                      })()
                    ) : null}
                    <span className="inline-block h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: cat.color || "hsl(var(--muted))" }} />
                    <span className="min-w-0 flex-1 truncate leading-tight">{cat.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t mt-4" />

            <div className="space-y-2">
              <Label htmlFor="cs-newCatName">Crear nueva categoría</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input id="cs-newCatName" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Ej. Comida" />
                <Button
                  type="button"
                  className="w-full sm:w-auto"
                  onClick={handleCreateInlineCategory}
                  disabled={creatingCat}
                >
                  {creatingCat ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Crear</> : "Crear"}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cs-newCatGroupId">Grupo de categoría</Label>
              <Select value={newCatGroupId || "__none__"} onValueChange={(v) => setNewCatGroupId(v === "__none__" ? "" : v)}>
                <SelectTrigger id="cs-newCatGroupId" disabled={categoryGroupsLoading}>
                  <SelectValue placeholder={categoryGroupsLoading ? "Cargando grupos..." : "Ninguno / Sin grupo (Opcional)"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Ninguno / Sin grupo (Opcional)</SelectItem>
                  {categoryGroups.map((group) => (
                    <SelectItem key={group.id} value={String(group.id)}>{group.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                {COLOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.name}
                    type="button"
                    className={cn("h-8 w-8 rounded-full border", newCatColor === opt.color ? "ring-2 ring-offset-2 ring-accent" : "")}
                    style={{ backgroundColor: opt.color }}
                    title={opt.name}
                    onClick={() => { setNewCatColor(opt.color); setNewCatColorName(opt.name); }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ícono</Label>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                {ICON_OPTIONS.map((key) => {
                  const C = (Icons as any)[key];
                  if (!C) return null;
                  const active = newCatIcon === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      className={cn("flex h-10 w-10 items-center justify-center rounded-md border", active ? "bg-accent ring-2 ring-accent/70" : "hover:bg-accent/40")}
                      title={key}
                      onClick={() => setNewCatIcon(key)}
                    >
                      <C className="h-5 w-5" style={{ color: newCatColor || undefined }} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
