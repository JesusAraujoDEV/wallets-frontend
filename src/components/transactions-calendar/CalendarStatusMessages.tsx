import { Loader2 } from "lucide-react";

interface CalendarStatusMessagesProps {
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
}

export function CalendarStatusMessages({ loading, error, isEmpty }: CalendarStatusMessagesProps) {
  return (
    <div className="mt-4">
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Cargando transacciones...</div>
      )}
      {!loading && error && (
        <div className="text-sm text-red-600">{error}</div>
      )}
      {!loading && !error && isEmpty && (
        <div className="text-sm text-muted-foreground">No hay datos para este mes (modo/alcance).</div>
      )}
    </div>
  );
}
