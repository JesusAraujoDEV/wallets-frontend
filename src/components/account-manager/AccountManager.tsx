import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { AccountEditorDialog } from "@/components/AccountEditorDialog";
import { AccountGrid } from "./AccountGrid";
import { DeleteAccountDialog } from "./DeleteAccountDialog";
import { useAccountManagerData } from "./useAccountManagerData";
import { useAccountFormDialog } from "./useAccountFormDialog";
import { useAccountDelete } from "./useAccountDelete";

export const AccountManager = () => {
  const { accounts, rate } = useAccountManagerData();
  const {
    isDialogOpen,
    setIsDialogOpen,
    editingAccount,
    isSubmitting,
    formData,
    setFormData,
    handleSubmit,
    handleOpenDialog,
  } = useAccountFormDialog();
  const { deletingId, confirmDeleteId, setConfirmDeleteId, handleDelete } = useAccountDelete();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Account Management</h2>
          <p className="text-muted-foreground mt-1">Create and manage your financial accounts</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90">
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Account
            </Button>
          </DialogTrigger>
        </Dialog>
        <AccountEditorDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          value={formData}
          onChange={setFormData}
          onSubmit={handleSubmit}
          submitting={isSubmitting}
          title={editingAccount ? "Edit Account" : "Create New Account"}
        />
      </div>

      <AccountGrid
        accounts={accounts}
        vesPerUsd={rate?.vesPerUsd}
        deletingId={deletingId}
        onEdit={handleOpenDialog}
        onRequestDelete={setConfirmDeleteId}
      />

      <DeleteAccountDialog
        confirmDeleteId={confirmDeleteId}
        deletingId={deletingId}
        onOpenChange={setConfirmDeleteId}
        onConfirm={async () => {
          if (!confirmDeleteId) return;
          await handleDelete(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
      />
    </div>
  );
};
