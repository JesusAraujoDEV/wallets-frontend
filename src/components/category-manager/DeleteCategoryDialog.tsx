import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface DeleteCategoryDialogProps {
  confirmDeleteId: string | null;
  deletingId: string | null;
  onOpenChange: (id: string | null) => void;
  onConfirm: () => void;
}

export const DeleteCategoryDialog = ({ confirmDeleteId, deletingId, onOpenChange, onConfirm }: DeleteCategoryDialogProps) => {
  return (
    <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => onOpenChange(open ? confirmDeleteId : null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete category?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the category and remove it from your transactions.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={!!deletingId}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={!!deletingId}
            onClick={onConfirm}
          >
            {deletingId ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
