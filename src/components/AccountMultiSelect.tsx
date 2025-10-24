import { useMemo, useState } from "react";
import type { Account } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, X } from "lucide-react";

interface Props {
  label: string;
  accounts: Account[];
  selected: string[]; // account ids
  onChange: (ids: string[]) => void;
  placeholder?: string;
}

export default function AccountMultiSelect({ label, accounts, selected, onChange, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const selectedAccounts = useMemo(
    () => accounts.filter((a) => selectedSet.has(a.id)),
    [accounts, selectedSet],
  );

  const toggle = (id: string) => {
    if (selectedSet.has(id)) onChange(selected.filter((x) => x !== id));
    else onChange([...selected, id]);
  };
  const clear = () => onChange([]);

  return (
    <div className="w-full">
      <div className="mb-2 text-sm font-medium text-muted-foreground">{label}</div>
      <div className="flex items-center gap-2 flex-wrap">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="truncate">
                {selected.length > 0
                  ? `${selected.length} seleccionada${selected.length === 1 ? "" : "s"}`
                  : placeholder || "Seleccionar cuentas"}
              </span>
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-64" align="start">
            <Command>
              <CommandInput placeholder="Buscar cuenta..." />
              <CommandList>
                <CommandEmpty>No hay resultados.</CommandEmpty>
                <CommandGroup>
                  {accounts.map((acc) => {
                    const checked = selectedSet.has(acc.id);
                    return (
                      <CommandItem key={acc.id} onSelect={() => toggle(acc.id)} className="gap-2">
                        <Checkbox checked={checked} onCheckedChange={() => toggle(acc.id)} />
                        <span className="flex-1 truncate">{acc.name}</span>
                        <span className="text-xs text-muted-foreground">{acc.currency}</span>
                        {checked ? <Check className="h-4 w-4 opacity-70" /> : null}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
            <div className="flex items-center justify-between gap-2 p-2 border-t bg-card/50">
              <Button variant="ghost" size="sm" onClick={clear} disabled={selected.length === 0}>
                Limpiar
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
                Cerrar
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {selectedAccounts.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {selectedAccounts.map((a) => (
              <Badge key={a.id} variant="secondary" className="flex items-center gap-1">
                <span className="truncate max-w-[160px]">{a.name}</span>
                <span className="text-xs text-muted-foreground">({a.currency})</span>
                <button
                  type="button"
                  className="ml-1 opacity-70 hover:opacity-100"
                  onClick={() => toggle(a.id)}
                  title="Quitar"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
