import { useMemo, useState } from "react";
import type { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, X } from "lucide-react";

interface Props {
  label: string;
  categories: Category[];
  selected: string[]; // category ids
  onChange: (ids: string[]) => void;
  placeholder?: string;
}

export default function CategoryMultiSelect({ label, categories, selected, onChange, placeholder }: Props) {
  const [open, setOpen] = useState(false);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const selectedCategories = useMemo(
    () => categories.filter((c) => selectedSet.has(c.id)),
    [categories, selectedSet],
  );

  const toggle = (id: string) => {
    if (selectedSet.has(id)) {
      onChange(selected.filter((x) => x !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const clear = () => onChange([]);

  return (
    <div className="w-full">
      <div className="mb-2 text-sm font-medium text-muted-foreground">{label}</div>
      <div className="flex items-center gap-2 flex-wrap">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-56 justify-between">
              <span className="truncate">
                {selected.length > 0
                  ? `${selected.length} seleccionada${selected.length === 1 ? "" : "s"}`
                  : placeholder || "Seleccionar categorías"}
              </span>
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-64" align="start">
            <Command>
              <CommandInput placeholder="Buscar categoría..." />
              <CommandList>
                <CommandEmpty>No hay resultados.</CommandEmpty>
                <CommandGroup>
                  {categories.map((cat) => {
                    const checked = selectedSet.has(cat.id);
                    return (
                      <CommandItem
                        key={cat.id}
                        onSelect={() => toggle(cat.id)}
                        className="gap-2"
                      >
                        <Checkbox checked={checked} onCheckedChange={() => toggle(cat.id)} />
                        <span className="flex-1 truncate">{cat.name}</span>
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

        {selectedCategories.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {selectedCategories.map((c) => (
              <Badge key={c.id} variant="secondary" className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="truncate max-w-[140px]">{c.name}</span>
                <button
                  type="button"
                  className="ml-1 opacity-70 hover:opacity-100"
                  onClick={() => toggle(c.id)}
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
