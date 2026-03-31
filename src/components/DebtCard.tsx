import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreditCard, Link2, MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { Debt } from "@/lib/types";

function statusBadge(status: Debt["status"]) {
  switch (status) {
    case "paid":
      return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">Pagada</Badge>;
    case "partial":
      return <Badge className="bg-amber-500 hover:bg-amber-600 text-white">Parcial</Badge>;
    default:
      return <Badge variant="destructive">Pendiente</Badge>;
  }
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("es", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

interface DebtCardProps {
  debt: Debt;
  onPay: (debt: Debt) => void;
  onEdit: (debt: Debt) => void;
  onDelete: (debt: Debt) => void;
  onLinkPast: (debt: Debt) => void;
}

export function DebtCard({ debt, onPay, onEdit, onDelete, onLinkPast }: DebtCardProps) {
  const progress =
    debt.totalAmount > 0
      ? Math.min((debt.paidAmount / debt.totalAmount) * 100, 100)
      : 0;

  const isPaid = debt.status === "paid";

  return (
    <Card className="border-border bg-card">
      <CardContent className="space-y-3 p-4">
        {/* Header: contact + status */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-foreground">
              {debt.contactName}
            </p>
            {debt.description && (
              <p className="truncate text-sm text-muted-foreground">
                {debt.description}
              </p>
            )}
          </div>
          {statusBadge(debt.status)}
        </div>

        {/* Amount info */}
        <div className="space-y-1">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-muted-foreground">
              Faltan {formatCurrency(debt.remaining, debt.currency)} de{" "}
              {formatCurrency(debt.totalAmount, debt.currency)}
            </span>
            <span className="text-xs text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Due date */}
        {debt.dueDate && (
          <p className="text-xs text-muted-foreground">
            Vence: {debt.dueDate}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-2">
          {/* Pay button — hidden when fully paid */}
          {!isPaid ? (
            <Button
              type="button"
              variant="default"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => onPay(debt)}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Abonar / Pagar
            </Button>
          ) : (
            <span />
          )}

          {/* Desktop actions */}
          <div className="hidden items-center gap-1 md:flex">
            {debt.categoryId && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onLinkPast(debt)}
                aria-label="Vincular pagos anteriores"
                title="Vincular pagos anteriores"
              >
                <Link2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(debt)}
              aria-label="Editar deuda"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(debt)}
              aria-label="Eliminar deuda"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile actions */}
          <div className="flex md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Más opciones</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!isPaid && (
                  <DropdownMenuItem onClick={() => onPay(debt)}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Abonar / Pagar
                  </DropdownMenuItem>
                )}
                {debt.categoryId && (
                  <DropdownMenuItem onClick={() => onLinkPast(debt)}>
                    <Link2 className="mr-2 h-4 w-4" />
                    Vincular pagos anteriores
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onEdit(debt)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(debt)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
