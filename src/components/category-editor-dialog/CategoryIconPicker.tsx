import type { CSSProperties } from "react";
import { Label } from "@/components/ui/label";
import { getCategoryIcon } from "@/components/CategoryIcon";
import type { CategoryEditorValue } from "./types";

export function CategoryIconPicker({
  value,
  onChange,
  iconOptions,
}: {
  value: CategoryEditorValue;
  onChange: (next: CategoryEditorValue) => void;
  iconOptions: string[];
}) {
  return (
    <div className="space-y-2">
      <Label>Icon</Label>
      <div className="pr-1">
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {iconOptions.map((key) => {
            const Icon = getCategoryIcon(key);
            if (!Icon) return null;
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
                <Icon className="h-5 w-5" style={{ color: value.color || undefined }} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
