import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export type CategoryEditorValue = {
  name: string;
  type: "income" | "expense";
  colorName: string;
};

const pastelColors = [
  { name: "Mint Green", hsl: "154 60% 65%" },
  { name: "Lavender", hsl: "228 40% 70%" },
  { name: "Peach", hsl: "4 100% 75%" },
  { name: "Pastel Yellow", hsl: "45 95% 75%" },
  { name: "Pastel Purple", hsl: "280 50% 75%" },
  { name: "Pastel Blue", hsl: "195 70% 75%" },
  { name: "Pastel Pink", hsl: "340 80% 75%" },
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title || "Edit Category"}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="space-y-4 py-2">
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
            <Select value={value.type} onValueChange={(v: any) => onChange({ ...value, type: v })}>
              <SelectTrigger id="category-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-4 gap-3">
              {pastelColors.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => onChange({ ...value, colorName: color.name })}
                  className={`group relative h-12 rounded-md transition-all ${
                    value.colorName === color.name ? "ring-2 ring-ring ring-offset-2" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: `hsl(${color.hsl})` }}
                >
                  <span className="sr-only">{color.name}</span>
                  {value.colorName === color.name && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-3 w-3 rounded-full bg-background" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">Selected: {value.colorName}</p>
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
