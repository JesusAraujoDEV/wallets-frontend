import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Languages } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n, t } = useTranslation();

  return (
    <Select value={i18n.language} onValueChange={(v) => i18n.changeLanguage(v)}>
      <SelectTrigger className={className} aria-label={t("common.language")}>
        <Languages className="mr-2 h-4 w-4 shrink-0" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>{lang.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
