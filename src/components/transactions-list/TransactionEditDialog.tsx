import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerField } from "@/components/DatePickerField";
import { Loader2 } from "lucide-react";
import type { Account, Category } from "@/lib/types";

export function TransactionEditDialog({ open, onOpenChange, formData, setFormData, categories, editCategories, accounts, saving, onSubmit, onCancel }: {
  open: boolean; onOpenChange: (open: boolean) => void;
  formData: { accountId: string; type: "income" | "expense"; amount: string; categoryId: string; description: string; date: string };
  setFormData: (v: any) => void;
  categories: Category[]; editCategories: Category[]; accounts: Account[];
  saving: boolean; onSubmit: (e: React.FormEvent) => void; onCancel: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg mx-auto max-h-[85vh] overflow-y-auto rounded-xl">
        <DialogHeader><DialogTitle>Editar transacción</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-date">Fecha</Label>
            <DatePickerField id="edit-date" value={formData.date} onChange={(iso) => setFormData({ ...formData, date: iso })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account">Cuenta</Label>
            <Select value={formData.accountId} onValueChange={(v) => setFormData({ ...formData, accountId: v })}>
              <SelectTrigger id="account"><SelectValue placeholder="Selecciona una cuenta" /></SelectTrigger>
              <SelectContent>
                {accounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={formData.type} onValueChange={(v: any) => {
                const nextType = v as 'income' | 'expense';
                const currentCat = categories.find(c => c.id === formData.categoryId);
                const nextCategoryId = currentCat && currentCat.type === nextType ? formData.categoryId : "";
                setFormData({ ...formData, type: nextType, categoryId: nextCategoryId });
              }}>
                <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Ingreso</SelectItem>
                  <SelectItem value="expense">Gasto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Monto</Label>
              <Input id="amount" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select value={formData.categoryId} onValueChange={(v) => setFormData({ ...formData, categoryId: v })}>
              <SelectTrigger id="category"><SelectValue placeholder="Selecciona una categoría" /></SelectTrigger>
              <SelectContent>
                {editCategories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Agrega una nota..." />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onCancel} disabled={saving}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={saving} aria-busy={saving}>
              {saving ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Guardando...</>) : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
