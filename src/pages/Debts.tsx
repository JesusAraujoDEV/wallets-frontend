import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Handshake, Loader2, Plus } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

import { DebtCard } from "@/components/DebtCard";
import { DebtFormDialog } from "@/components/DebtFormDialog";
import { DebtPayDialog } from "@/components/DebtPayDialog";

import {
  createDebt,
  DEBTS_QUERY_KEY,
  deleteDebt,
  fetchDebts,
  payDebt,
  updateDebt,
} from "@/lib/debts";
import { AccountsStore, onDataChange } from "@/lib/storage";
import type {
  Account,
  CreateDebtPayload,
  Debt,
  UpdateDebtPayload,
} from "@/lib/types";

export default function Debts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingDebt, setDeletingDebt] = useState<Debt | null>(null);

  // Load accounts
  useEffect(() => {
    AccountsStore.refresh()
      .then(() => setAccounts(AccountsStore.all()))
      .catch(() => {});
    const off = onDataChange(() => setAccounts(AccountsStore.all()));
    return off;
  }, []);

  const debtsQuery = useQuery({
    queryKey: DEBTS_QUERY_KEY,
    queryFn: fetchDebts,
  });

  const debts = debtsQuery.data ?? [];
  const payableDebts = debts.filter((d) => d.type === "payable");
  const receivableDebts = debts.filter((d) => d.type === "receivable");

  // ── Mutations ──────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: (payload: CreateDebtPayload) => createDebt(payload),
    onSuccess: async () => {
      toast({ title: "Deuda creada", description: "La deuda fue registrada correctamente." });
      setFormOpen(false);
      setEditingDebt(null);
      await queryClient.invalidateQueries({ queryKey: DEBTS_QUERY_KEY });
    },
    onError: (error) => {
      toast({
        title: "No se pudo crear la deuda",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDebtPayload }) =>
      updateDebt(id, payload),
    onSuccess: async () => {
      toast({ title: "Deuda actualizada", description: "Los cambios se guardaron correctamente." });
      setFormOpen(false);
      setEditingDebt(null);
      await queryClient.invalidateQueries({ queryKey: DEBTS_QUERY_KEY });
    },
    onError: (error) => {
      toast({
        title: "No se pudo actualizar la deuda",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDebt(id),
    onSuccess: async () => {
      toast({ title: "Deuda eliminada", description: "La deuda se eliminó correctamente." });
      setDeleteOpen(false);
      setDeletingDebt(null);
      await queryClient.invalidateQueries({ queryKey: DEBTS_QUERY_KEY });
    },
    onError: (error) => {
      toast({
        title: "No se pudo eliminar la deuda",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const payMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { amount: number; currency: string; accountId: number; date: string } }) =>
      payDebt(id, payload),
    onSuccess: async () => {
      toast({ title: "Abono registrado", description: "El pago se registró correctamente." });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: DEBTS_QUERY_KEY }),
        AccountsStore.refresh(),
      ]);
    },
    onError: (error) => {
      toast({
        title: "No se pudo registrar el abono",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleFormSubmit(values: {
    contactName: string;
    description: string;
    totalAmount: number;
    currency: "USD" | "EUR" | "VES";
    type: "payable" | "receivable";
    dueDate: string;
  }) {
    if (editingDebt) {
      updateMutation.mutate({
        id: editingDebt.id,
        payload: {
          contactName: values.contactName.trim(),
          description: values.description.trim(),
          totalAmount: values.totalAmount,
          currency: values.currency,
          type: values.type,
          dueDate: values.dueDate,
        },
      });
    } else {
      createMutation.mutate({
        contactName: values.contactName.trim(),
        description: values.description.trim(),
        totalAmount: values.totalAmount,
        currency: values.currency,
        type: values.type,
        dueDate: values.dueDate,
      });
    }
  }

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

  // ── Render helpers ─────────────────────────────────────────────────────────

  function renderDebtGrid(list: Debt[]) {
    if (debtsQuery.isLoading) {
      return (
        <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando deudas...
        </div>
      );
    }
    if (list.length === 0) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Sin deudas registradas</AlertTitle>
          <AlertDescription>
            Crea una nueva deuda para empezar a llevar el control.
          </AlertDescription>
        </Alert>
      );
    }
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {list.map((debt) => (
          <DebtCard
            key={debt.id}
            debt={debt}
            onPay={openPay}
            onEdit={openEdit}
            onDelete={openDeleteConfirm}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Tabs: Por Pagar / Por Cobrar */}
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
          {renderDebtGrid(payableDebts)}
        </TabsContent>

        <TabsContent value="receivable" className="mt-4">
          {renderDebtGrid(receivableDebts)}
        </TabsContent>
      </Tabs>

      {/* CRUD Dialog */}
      <DebtFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        debt={editingDebt}
        submitting={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleFormSubmit}
      />

      {/* Pay Dialog */}
      <DebtPayDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        debt={payingDebt}
        accounts={accounts}
        onConfirm={async (payload) => {
          if (!payingDebt) return;
          await payMutation.mutateAsync({ id: payingDebt.id, payload });
        }}
      />

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="w-[95vw] sm:w-full max-w-md rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar deuda?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará la deuda de {deletingDebt?.contactName}. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:gap-3">
            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (deletingDebt) deleteMutation.mutate(deletingDebt.id);
              }}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
