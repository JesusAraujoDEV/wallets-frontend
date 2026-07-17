import { format } from "date-fns";
import { de, enUS, es } from "date-fns/locale";

const DATE_FNS_LOCALES = { es, en: enUS, de } as const;

export function formatPeriodLabel(start: string | undefined, end: string | undefined, language: string): string {
  if (!start || !end) return "";
  const locale = DATE_FNS_LOCALES[language as keyof typeof DATE_FNS_LOCALES] ?? enUS;
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  const sameYear = startDate.getFullYear() === endDate.getFullYear();
  const startFmt = sameYear ? "d MMM" : "d MMM yyyy";
  return `${format(startDate, startFmt, { locale })} – ${format(endDate, "d MMM yyyy", { locale })}`;
}
