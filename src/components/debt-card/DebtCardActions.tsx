import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreditCard, Link2, MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { Debt } from "@/lib/types";

interface DebtCardActionsProps {
  debt: Debt;
  isPaid: boolean;
  onPay: (debt: Debt) => void;
  onEdit: (debt: Debt) => void;
  onDelete: (debt: Debt) => void;
  onLinkPast: (debt: Debt) => void;
}

export function DebtCardActions({
  debt,
  isPaid,
  onPay,
  onEdit,
  onDelete,
  onLinkPast,
}: DebtCardActionsProps) {
  return (
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
  );
}
