import type { CategoryGroup } from "@/lib/types";

export type CategoryEditorValue = {
  name: string;
  type: "income" | "expense";
  groupId: string;
  color: string;
  colorName: string;
  icon?: string | null;
};

export type CategoryEditorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: CategoryEditorValue;
  onChange: (next: CategoryEditorValue) => void;
  onSubmit: () => void;
  submitting?: boolean;
  title?: string;
  description?: string;
  groups: CategoryGroup[];
  groupsLoading?: boolean;
};

export const presetColors = [
  { name: "Chart 1", value: "hsl(var(--chart-1))" },
  { name: "Chart 2", value: "hsl(var(--chart-2))" },
  { name: "Chart 3", value: "hsl(var(--chart-3))" },
  { name: "Chart 4", value: "hsl(var(--chart-4))" },
  { name: "Chart 5", value: "hsl(var(--chart-5))" },
  { name: "Sky Blue", value: "hsl(var(--chart-6))" },
  { name: "Primary", value: "hsl(var(--primary))" },
  { name: "Secondary", value: "hsl(var(--secondary))" },
  { name: "Accent", value: "hsl(var(--accent))" },
  { name: "Green", value: "#22c55e" },
  { name: "Red", value: "#ef4444" },
  { name: "Amber", value: "#f59e0b" },
];
