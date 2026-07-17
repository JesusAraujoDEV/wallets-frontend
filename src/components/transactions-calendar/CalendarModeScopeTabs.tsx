import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CalendarMode, CalendarScope } from "./types";

interface CalendarModeScopeTabsProps {
  mode: CalendarMode;
  scope: CalendarScope;
  onModeChange: (mode: CalendarMode) => void;
  onScopeChange: (scope: CalendarScope) => void;
}

export function CalendarModeScopeTabs({ mode, scope, onModeChange, onScopeChange }: CalendarModeScopeTabsProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
      <div>
        <Tabs value={mode} onValueChange={(v) => onModeChange(v as CalendarMode)}>
          <TabsList className="grid grid-cols-3 w-full md:w-auto md:inline-grid">
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="expense">Expense</TabsTrigger>
            <TabsTrigger value="balance">Balance</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div>
        <Tabs value={scope} onValueChange={(v) => onScopeChange(v as CalendarScope)}>
          <TabsList className="grid grid-cols-2 w-full md:w-auto md:inline-grid">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="stats">Stats Only</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
