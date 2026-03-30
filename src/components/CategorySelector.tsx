import { useState } from "react";
import * as Icons from "lucide-react";
import { Plus } from "lucide-react";
import type { Category } from "@/lib/types";
import { cn, isBalanceAdjustmentCategory } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryIcon } from "@/components/CategoryIcon";
import { CategoryFormModal } from "@/components/CategoryFormModal";

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
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const pickerFilteredCategories = categories
    .filter((c) => c.type === pickerType)
    .filter((c) => !isBalanceAdjustmentCategory(c.name));

  const selectedCategory = categories.find((c) => c.id === value) ?? null;

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

              {/* Botón para crear nueva categoría */}
              <button
                type="button"
                onClick={() => setCreateModalOpen(true)}
                className={cn(
                  "flex h-auto w-full max-w-full items-center justify-center gap-2 rounded-md border-2 border-dashed",
                  "border-muted-foreground/30 px-3 py-3 text-sm text-muted-foreground",
                  "hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-colors",
                )}
              >
                <Plus className="h-5 w-5" />
                <span className="font-medium">Crear Nueva Categoría</span>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal épica de creación de categoría */}
      <CategoryFormModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        defaultType={pickerType}
        onSuccess={(newCat) => {
          onChange(newCat.id);
          setCreateModalOpen(false);
          setModalOpen(false);
        }}
      />
    </>
  );
}
