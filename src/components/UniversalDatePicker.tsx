import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface UniversalDatePickerProps {
  value: string; // ISO date string YYYY-MM-DD or ""
  onChange: (date: string) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
}

export function UniversalDatePicker({
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  id,
  disabled,
  className,
}: UniversalDatePickerProps) {
  const [open, setOpen] = useState(false);

  const selected = value ? new Date(value + "T00:00:00") : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected
            ? format(selected, "PPP", { locale: es })
            : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(day) => {
            if (day) {
              const iso = format(day, "yyyy-MM-dd");
              onChange(iso);
            } else {
              onChange("");
            }
            setOpen(false);
          }}
          initialFocus
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  );
}
