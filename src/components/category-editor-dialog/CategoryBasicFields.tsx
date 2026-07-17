import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { CategoryGroup } from "@/lib/types";
import type { CategoryEditorValue } from "./types";

export function CategoryBasicFields({
  value,
  onChange,
  groups,
  groupsLoading,
}: {
  value: CategoryEditorValue;
  onChange: (next: CategoryEditorValue) => void;
  groups: CategoryGroup[];
  groupsLoading?: boolean;
}) {
  return (
    <>
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
        <Label htmlFor="category-group">Category Group</Label>
        <Select value={value.groupId || "__none__"} onValueChange={(next) => onChange({ ...value, groupId: next === "__none__" ? "" : next })}>
          <SelectTrigger id="category-group" disabled={groupsLoading}>
            <SelectValue placeholder={groupsLoading ? "Loading groups..." : "Ninguno / Sin grupo (Opcional)"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Ninguno / Sin grupo (Opcional)</SelectItem>
            {groups.map((group) => (
              <SelectItem key={group.id} value={String(group.id)}>{group.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
