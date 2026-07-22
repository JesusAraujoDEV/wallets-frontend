import type { LucideIcon } from "lucide-react";

export function ProfileField({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return (
    <div className="group flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4 transition-colors hover:bg-muted/70">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        <p className="mt-1 break-words text-base font-medium text-card-foreground">{value}</p>
      </div>
    </div>
  );
}
