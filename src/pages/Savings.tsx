import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { PiggyBank, PlusCircle } from "lucide-react";
import { AccountEditorDialog } from "@/components/AccountEditorDialog";
import { AccountGrid } from "@/components/account-manager/AccountGrid";
import { DeleteAccountDialog } from "@/components/account-manager/DeleteAccountDialog";
import { useAccountManagerData } from "@/components/account-manager/useAccountManagerData";
import { useAccountFormDialog } from "@/components/account-manager/useAccountFormDialog";
import { useAccountDelete } from "@/components/account-manager/useAccountDelete";

const SAVINGS_TYPE = "meta_ahorro";

export default function Savings() {
  const { t } = useTranslation();
  const { accounts, rate } = useAccountManagerData();
  const savingsAccounts = accounts.filter((a) => a.type === SAVINGS_TYPE);
  const {
    isDialogOpen, setIsDialogOpen, isSubmitting, formData, setFormData, handleSubmit, handleOpenDialog,
  } = useAccountFormDialog(SAVINGS_TYPE);
  const { deletingId, confirmDeleteId, setConfirmDeleteId, handleDelete } = useAccountDelete();

  const totalUsd = savingsAccounts.reduce((sum, a) => {
    if (a.currency === "USD") return sum + a.balance;
    if (a.currency === "VES" && rate?.vesPerUsd) return sum + a.balance / rate.vesPerUsd;
    return sum;
  }, 0);

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-2xl text-card-foreground">
                <PiggyBank className="h-6 w-6" />
                {t("nav.savings")}
              </CardTitle>
              <CardDescription>{t("savings.subtitle")}</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto" onClick={() => handleOpenDialog()}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t("savings.newGoal")}
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
              title={t("savings.newGoal")}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">{t("savings.totalLabel")}</div>
          <div className="text-3xl font-bold text-foreground">${totalUsd.toFixed(2)}</div>
        </CardContent>
      </Card>

      {savingsAccounts.length === 0 ? (
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="py-10 text-center text-muted-foreground">{t("savings.empty")}</CardContent>
        </Card>
      ) : (
        <AccountGrid
          accounts={savingsAccounts}
          vesPerUsd={rate?.vesPerUsd}
          deletingId={deletingId}
          onEdit={handleOpenDialog}
          onRequestDelete={setConfirmDeleteId}
        />
      )}

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
}
