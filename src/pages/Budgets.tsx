import { CategoryIcon } from "@/components/CategoryIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { createBudget, fetchBudgetsStatus } from "@/lib/budgets";
import { CategoriesStore } from "@/lib/storage";
import type { BudgetStatus, Category, CreateBudgetPayload } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Loader2, PiggyBank } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

type BudgetFormValues = {
  categoryId: string;
  amount: number;
  month: string;
};

function formatMoney(value: number) {
  return `$${Math.abs(value).toFixed(2)}`;
}

function progressColorClass(percentageUsed: number) {
  if (percentageUsed < 80) return "[&>div]:bg-emerald-500";
  if (percentageUsed < 100) return "[&>div]:bg-amber-500";
  return "[&>div]:bg-red-500";
}

export default function Budgets() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [budgets, setBudgets] = useState<BudgetStatus[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const { toast } = useToast();

  const {
    handleSubmit,
    setValue,
    watch,
    register,
    reset,
    formState: { errors },
  } = useForm<BudgetFormValues>({
    defaultValues: {
      categoryId: "global",
      amount: undefined as unknown as number,
      month: currentMonth,
    },
  });

  const selectedCategoryId = watch("categoryId");

  const expenseCategories = useMemo(
    () => categories.filter((category) => category.type === "expense"),
    [categories],
  );

  const loadBudgetsData = useCallback(async () => {
    setLoading(true);
    try {
      await CategoriesStore.refresh();
      setCategories(CategoriesStore.all());
      const status = await fetchBudgetsStatus();
      setBudgets(status);
    } catch (error) {
      toast({
        title: "No se pudieron cargar los presupuestos",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadBudgetsData();
  }, [loadBudgetsData]);

  const onCreateBudget = handleSubmit(async (values) => {
    if (!Number.isFinite(values.amount) || values.amount <= 0) {
      toast({
        title: "Monto inválido",
        description: "El monto del presupuesto debe ser mayor a cero.",
        variant: "destructive",
      });
      return;
    }

    if (!/^\d{4}-\d{2}$/.test(values.month)) {
      toast({
        title: "Mes inválido",
        description: "El mes debe tener formato YYYY-MM.",
        variant: "destructive",
      });
      return;
    }

    const payload: CreateBudgetPayload = {
      amount: values.amount,
      month: values.month,
      categoryId: values.categoryId === "global" ? null : Number(values.categoryId),
    };

    setCreateLoading(true);
    try {
      console.log(payload);
      await createBudget(payload);
      toast({
        title: "Presupuesto creado",
        description: "El presupuesto se guardó correctamente.",
      });
      setCreateDialogOpen(false);
      reset({ categoryId: "global", amount: undefined as unknown as number, month: currentMonth });
      await loadBudgetsData();
    } catch (error) {
      toast({
        title: "No se pudo crear el presupuesto",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setCreateLoading(false);
    }
  });

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl text-card-foreground">Presupuestos</CardTitle>
              <CardDescription>
                Controla tus límites por categoría y detecta en segundos cuándo estás por quedarte sin margen.
              </CardDescription>
            </div>
            <Button type="button" className="w-full sm:w-auto" onClick={() => setCreateDialogOpen(true)}>
              Crear Presupuesto
            </Button>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="flex min-h-44 items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Cargando presupuestos...
          </CardContent>
        </Card>
      ) : budgets.length === 0 ? (
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="flex min-h-44 flex-col items-center justify-center gap-3 text-center">
            <PiggyBank className="h-10 w-10 text-emerald-600" />
            <div>
              <p className="text-base font-semibold text-foreground">Aún no tienes presupuestos activos</p>
              <p className="text-sm text-muted-foreground">Crea tu primer presupuesto para visualizar alertas por categoría.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {budgets.map((budget) => {
            const percentage = Math.max(0, Math.min(100, Number(budget.percentageUsed || 0)));
            const overBudget = Number(budget.remaining) < 0;
            const remainingAmount = Math.abs(Number(budget.remaining || 0));

            return (
              <Card key={budget.id} className="border-border bg-card shadow-sm">
                <CardHeader className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-lg"
                      style={{ backgroundColor: budget.category.color ? `${budget.category.color}22` : "hsl(var(--muted))" }}
                    >
                      <CategoryIcon
                        name={budget.category.icon}
                        color={budget.category.color || "hsl(var(--chart-2))"}
                        className="h-5 w-5"
                      />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="truncate text-lg text-card-foreground">{budget.category.name}</CardTitle>
                      <CardDescription>
                        {formatMoney(Number(budget.spent || 0))} / {formatMoney(Number(budget.budgeted || 0))}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Progress value={percentage} className={cn("h-3", progressColorClass(Number(budget.percentageUsed || 0)))} />
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {Number(budget.percentageUsed || 0).toFixed(0)}% usado
                    </p>
                  </div>

                  <p className={cn("text-sm font-medium", overBudget ? "text-red-600" : "text-emerald-600")}>
                    {overBudget ? `Te excediste por ${formatMoney(remainingAmount)}` : `Te quedan ${formatMoney(remainingAmount)}`}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) {
            reset({ categoryId: "global", amount: undefined as unknown as number, month: currentMonth });
          }
        }}
      >
        <DialogContent className="w-[95vw] max-w-md sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Presupuesto</DialogTitle>
            <DialogDescription>Asigna un límite mensual para controlar tus gastos por categoría.</DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={onCreateBudget}>
            <div className="space-y-2">
              <Label htmlFor="budget-category">Categoría</Label>
              <Select
                value={selectedCategoryId}
                onValueChange={(value) => {
                  setValue("categoryId", value, { shouldValidate: true });
                }}
                disabled={createLoading}
              >
                <SelectTrigger id="budget-category">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Presupuesto Global</SelectItem>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" {...register("categoryId")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget-amount">Monto</Label>
              <Input
                id="budget-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                disabled={createLoading}
                {...register("amount", {
                  valueAsNumber: true,
                  required: "El monto es obligatorio.",
                  validate: (value) => (Number.isFinite(value) && value > 0) || "El monto debe ser mayor a cero.",
                })}
              />
              {errors.amount ? <p className="text-xs text-red-500">{errors.amount.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget-month">Mes</Label>
              <input
                id="budget-month"
                type="month"
                disabled={createLoading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("month", {
                  required: "El mes es obligatorio.",
                  pattern: {
                    value: /^\d{4}-\d{2}$/,
                    message: "El mes debe tener formato YYYY-MM.",
                  },
                })}
              />
              {errors.month ? <p className="text-xs text-red-500">{errors.month.message}</p> : null}
            </div>

            <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-4">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setCreateDialogOpen(false)}
                disabled={createLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto" disabled={createLoading} aria-busy={createLoading}>
                {createLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar presupuesto"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
