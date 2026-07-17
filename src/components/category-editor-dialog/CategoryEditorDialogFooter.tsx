import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

export function CategoryEditorDialogFooter({
  onOpenChange,
  onSubmit,
  submitting,
  saveDisabled,
}: {
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  submitting?: boolean;
  saveDisabled: boolean;
}) {
  return (
    <DialogFooter>
      <Button variant="outline" onClick={() => onOpenChange(false)} disabled={!!submitting}>Cancel</Button>
      <Button onClick={onSubmit} disabled={saveDisabled} aria-busy={!!submitting}>
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
  );
}
