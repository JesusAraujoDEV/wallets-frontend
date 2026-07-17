// Backend returns weekday columns Sunday-first (index 0 = Sunday); 2023-01-01 was a Sunday.
export function localizedWeekdays(locale: string): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(Date.UTC(2023, 0, 1 + i))));
}
