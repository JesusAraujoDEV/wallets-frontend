import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs from "dayjs";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// MUI's DateCalendar ignores the app's Tailwind dark-mode class — without an
// explicit dark palette it renders dark text on the (correctly dark) popover
// background, making it unreadable. Mirror next-themes' resolved theme here.
function useCalendarTheme() {
  const { resolvedTheme } = useTheme();
  return useMemo(() => createTheme({ palette: { mode: resolvedTheme === "dark" ? "dark" : "light" } }), [resolvedTheme]);
}

export function DatePickerField({ id, value, onChange }: { id?: string; value: string; onChange: (iso: string) => void }) {
  const { t } = useTranslation();
  const muiTheme = useCalendarTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button id={id} variant="outline" className={cn("w-full justify-start text-left font-normal")} type="button">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? dayjs(value).format("YYYY-MM-DD") : <span>{t("common.pickDate")}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2 max-h-[80vh] overflow-y-auto" align="start">
        <ThemeProvider theme={muiTheme}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
              value={value ? dayjs(value) : null}
              onChange={(d: any) => { if (d) onChange(d.format("YYYY-MM-DD")); }}
              sx={{
                "& .MuiYearCalendar-root": {
                  WebkitOverflowScrolling: "touch",
                  touchAction: "pan-y",
                },
              }}
            />
          </LocalizationProvider>
        </ThemeProvider>
      </PopoverContent>
    </Popover>
  );
}
