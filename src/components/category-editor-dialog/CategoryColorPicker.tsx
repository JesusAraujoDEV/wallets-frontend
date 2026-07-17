import { useRef, type CSSProperties } from "react";
import { Label } from "@/components/ui/label";
import { presetColors, type CategoryEditorValue } from "./types";

export function CategoryColorPicker({
  value,
  onChange,
  isCustomColor,
  selectedColorLabel,
}: {
  value: CategoryEditorValue;
  onChange: (next: CategoryEditorValue) => void;
  isCustomColor: boolean;
  selectedColorLabel: string;
}) {
  const colorInputRef = useRef<HTMLInputElement | null>(null);

  return (
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
  );
}
