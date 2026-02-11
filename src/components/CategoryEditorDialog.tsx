import { useRef, type CSSProperties } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Loader2 } from "lucide-react";
import * as Icons from "lucide-react";
import { getIconOptionsForType } from "@/lib/categoryIcons";

export type CategoryEditorValue = {
  name: string;
  type: "income" | "expense";
  color: string;
  colorName: string;
  icon?: string | null;
};

const presetColors = [
  { name: "Chart 1", value: "hsl(var(--chart-1))" },
  { name: "Chart 2", value: "hsl(var(--chart-2))" },
  { name: "Chart 3", value: "hsl(var(--chart-3))" },
  { name: "Chart 4", value: "hsl(var(--chart-4))" },
  { name: "Chart 5", value: "hsl(var(--chart-5))" },
  { name: "Pastel Blue", value: "hsl(var(--chart-6))" },
  { name: "Primary", value: "hsl(var(--primary))" },
  { name: "Secondary", value: "hsl(var(--secondary))" },
  { name: "Accent", value: "hsl(var(--accent))" },
  { name: "Green", value: "#22c55e" },
  { name: "Red", value: "#ef4444" },
  { name: "Amber", value: "#f59e0b" },
];

export function CategoryEditorDialog({
  open,
  onOpenChange,
  value,
  onChange,
  onSubmit,
  submitting,
  title,
  description,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: CategoryEditorValue;
  onChange: (next: CategoryEditorValue) => void;
  onSubmit: () => void;
  submitting?: boolean;
  title?: string;
  description?: string;
}) {
  const colorInputRef = useRef<HTMLInputElement | null>(null);
  const iconOptions = getIconOptionsForType(value.type);
  const isCustomColor = !presetColors.some((c) => c.value === value.color);
  const selectedColorLabel = isCustomColor ? value.color : value.colorName;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-xl bg-background/95 backdrop-blur shadow-lg">
        <DialogHeader>
          <DialogTitle>{title || "Edit Category"}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="space-y-2">
            <Label htmlFor="category-name">Category Name</Label>
            <Input
              id="category-name"
              placeholder="e.g., Groceries, Rent, Gifts"
              value={value.name}
              onChange={(e) => onChange({ ...value, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category-type">Type</Label>
            <ToggleGroup
              type="single"
              value={value.type}
              onValueChange={(v) => v && onChange({ ...value, type: v as "income" | "expense" })}
              className="justify-start"
            >
              <ToggleGroupItem value="expense" aria-label="Expense">Expense</ToggleGroupItem>
              <ToggleGroupItem value="income" aria-label="Income">Income</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {presetColors.map((opt) => {
                const active = value.color === opt.value;
                return (
                  <button
                    key={opt.name}
                    type="button"
                    className={`h-8 w-8 rounded-full border transition ${active ? "ring-2 ring-offset-2" : "hover:scale-105"}`}
                    style={{ backgroundColor: opt.value, ...(active ? ({ "--tw-ring-color": opt.value } as CSSProperties) : {}) }}
                    title={opt.name}
                    onClick={() => onChange({ ...value, color: opt.value, colorName: opt.name })}
                  />
                );
              })}
              <button
                type="button"
                className={`h-8 w-8 rounded-full border transition ${isCustomColor ? "ring-2 ring-offset-2" : "hover:scale-105"}`}
                style={{
                  backgroundImage: "conic-gradient(#f43f5e, #f59e0b, #22c55e, #3b82f6, #a855f7, #f43f5e)",
                  ...(isCustomColor ? ({ "--tw-ring-color": value.color } as CSSProperties) : {}),
                }}
                aria-label="Pick custom color"
                title="Custom color"
                onClick={() => colorInputRef.current?.click()}
              />
              <input
                ref={colorInputRef}
                type="color"
                className="hidden"
                value={isCustomColor ? value.color : "#3b82f6"}
                onChange={(e) => onChange({ ...value, color: e.target.value, colorName: e.target.value })}
              />
            </div>
            <div className="text-sm text-muted-foreground">Selected: <span className="font-medium">{selectedColorLabel}</span></div>
          </div>
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="max-h-56 overflow-y-auto pr-1">
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {iconOptions.map((key) => {
                  const C = (Icons as any)[key];
                  if (!C) return null;
                  const active = value.icon === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`h-10 w-10 rounded-md border flex items-center justify-center transition ${active ? "bg-accent ring-2 ring-offset-2" : "hover:bg-accent/40"}`}
                      style={active ? ({ "--tw-ring-color": value.color } as CSSProperties) : undefined}
                      title={key}
                      onClick={() => onChange({ ...value, icon: key })}
                    >
                      <C className="h-5 w-5" style={{ color: value.color || undefined }} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={!!submitting}>Cancel</Button>
          <Button onClick={onSubmit} disabled={!!submitting} aria-busy={!!submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
