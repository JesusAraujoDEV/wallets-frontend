import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getIconOptionsForType } from "@/lib/categoryIcons";
import { CategoryBasicFields } from "./CategoryBasicFields";
import { CategoryColorPicker } from "./CategoryColorPicker";
import { CategoryIconPicker } from "./CategoryIconPicker";
import { CategoryEditorDialogFooter } from "./CategoryEditorDialogFooter";
import { presetColors, type CategoryEditorDialogProps } from "./types";

export function CategoryEditorDialog({
  open,
  onOpenChange,
  value,
  onChange,
  onSubmit,
  submitting,
  title,
  description,
  groups,
  groupsLoading,
}: CategoryEditorDialogProps) {
  const iconOptions = getIconOptionsForType(value.type);
  const isCustomColor = !presetColors.some((c) => c.value === value.color);
  const selectedColorLabel = isCustomColor ? value.color : value.colorName;
  const saveDisabled = !!submitting || groupsLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg mx-auto max-h-[85vh] overflow-y-auto rounded-xl bg-background/95 backdrop-blur shadow-lg">
        <DialogHeader>
          <DialogTitle>{title || "Edit Category"}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="space-y-4 pr-1">
          <CategoryBasicFields value={value} onChange={onChange} groups={groups} groupsLoading={groupsLoading} />
          <CategoryColorPicker
            value={value}
            onChange={onChange}
            isCustomColor={isCustomColor}
            selectedColorLabel={selectedColorLabel}
          />
          <CategoryIconPicker value={value} onChange={onChange} iconOptions={iconOptions} />
        </div>
        <CategoryEditorDialogFooter
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
          submitting={submitting}
          saveDisabled={!!saveDisabled}
        />
      </DialogContent>
    </Dialog>
  );
}
