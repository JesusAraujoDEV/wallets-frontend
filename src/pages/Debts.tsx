import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Handshake, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

import { DebtFormDialog } from "@/components/DebtFormDialog";
import { DebtPayDialog } from "@/components/DebtPayDialog";
import { LinkTransactionsDialog } from "@/components/LinkTransactionsDialog";

import { DEBTS_QUERY_KEY } from "@/lib/debts";
import type { Debt } from "@/lib/types";

import { DebtGridSection } from "./debts/DebtGridSection";
import { DeleteDebtDialog } from "./debts/DeleteDebtDialog";
import { useDebtCrudMutations } from "./debts/useDebtCrudMutations";
import { useDebtFormHandlers } from "./debts/useDebtFormHandlers";
import { useDebtQueries } from "./debts/useDebtQueries";
import { useDebtsReferenceData } from "./debts/useDebtsReferenceData";
import { usePayDebtMutation } from "./debts/usePayDebtMutation";

export default function Debts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { accounts, categories } = useDebtsReferenceData();
  const { debtsQuery, payableDebts, receivableDebts } = useDebtQueries();
  const payMutation = usePayDebtMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingDebt, setDeletingDebt] = useState<Debt | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkingDebt, setLinkingDebt] = useState<Debt | null>(null);

  const mutations = useDebtCrudMutations({
    onSaved: () => {
      setFormOpen(false);
      setEditingDebt(null);
    },
    onDeleted: () => {
      setDeleteOpen(false);
      setDeletingDebt(null);
    },
  });
  const { handleFormSubmit } = useDebtFormHandlers({ editingDebt, mutations });

  function openCreate() {
    setEditingDebt(null);
    setFormOpen(true);
  }

  function openEdit(debt: Debt) {
    setEditingDebt(debt);
    setFormOpen(true);
  }

  function openPay(debt: Debt) {
    setPayingDebt(debt);
    setPayOpen(true);
  }

  function openDeleteConfirm(debt: Debt) {
    setDeletingDebt(debt);
    setDeleteOpen(true);
  }

  function handleLinkPast(debt: Debt) {
    setLinkingDebt(debt);
    setLinkOpen(true);
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-2xl text-card-foreground">
                <Handshake className="h-6 w-6" />
                Deudas
              </CardTitle>
              <CardDescription>
                Controla lo que debes y lo que te deben. Registra abonos parciales o pagos completos.
              </CardDescription>
            </div>
            <Button type="button" className="w-full sm:w-auto" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Deuda
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="payable" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="payable">
            Por Pagar ({payableDebts.length})
          </TabsTrigger>
          <TabsTrigger value="receivable">
            Por Cobrar ({receivableDebts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payable" className="mt-4">
          <DebtGridSection
            debts={payableDebts}
            isLoading={debtsQuery.isLoading}
            onPay={openPay}
            onEdit={openEdit}
            onDelete={openDeleteConfirm}
            onLinkPast={handleLinkPast}
          />
        </TabsContent>

        <TabsContent value="receivable" className="mt-4">
          <DebtGridSection
            debts={receivableDebts}
            isLoading={debtsQuery.isLoading}
            onPay={openPay}
            onEdit={openEdit}
            onDelete={openDeleteConfirm}
            onLinkPast={handleLinkPast}
          />
        </TabsContent>
      </Tabs>

      <DebtFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        debt={editingDebt}
        categories={categories}
        submitting={mutations.createMutation.isPending || mutations.updateMutation.isPending}
        onSubmit={handleFormSubmit}
      />

      <DebtPayDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        debt={payingDebt}
        accounts={accounts}
        categories={categories}
        onConfirm={async (payload) => {
          if (!payingDebt) return;
          await payMutation.mutateAsync({ id: payingDebt.id, payload });
        }}
      />

      <DeleteDebtDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        debt={deletingDebt}
        isPending={mutations.deleteMutation.isPending}
        onConfirm={() => {
          if (deletingDebt) mutations.deleteMutation.mutate(deletingDebt.id);
        }}
      />

      <LinkTransactionsDialog
        open={linkOpen}
        onOpenChange={setLinkOpen}
        debt={linkingDebt}
        onLinked={async (count) => {
          toast({
            title: "Vinculación completada",
            description: `Se han vinculado ${count} transacciones anteriores a esta deuda.`,
          });
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: DEBTS_QUERY_KEY }),
            queryClient.invalidateQueries({ queryKey: ["transactions"] }),
            queryClient.invalidateQueries({ queryKey: ["summary"] }),
          ]);
        }}
      />
    </div>
  );
}
