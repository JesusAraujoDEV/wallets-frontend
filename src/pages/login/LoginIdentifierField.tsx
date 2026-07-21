import { AtSign } from "lucide-react";
import { useTranslation } from "react-i18next";
import { isValidEmail, sanitizeEmailInput, sanitizeUsernameInput } from "@/lib/validation";
import type { FieldErrors } from "./types";

export function LoginIdentifierField({ value, onChange, error, setFieldErrors, isLogin }: {
  value: string; onChange: (v: string) => void; error?: string;
  setFieldErrors: (updater: (prev: FieldErrors) => FieldErrors) => void; isLogin: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="relative">
      <AtSign className="absolute left-3 top-3 text-muted-foreground h-5 w-5" />
      <input
        value={value}
        onChange={(e) => {
          let val = e.target.value;
          if (val.includes("@")) {
            const sanitized = sanitizeEmailInput(val);
            if (sanitized !== val) setFieldErrors((prev) => ({ ...prev, identifier: t("auth.validation.emailInvalidChars") }));
            val = sanitized;
          } else {
            const sanitized = sanitizeUsernameInput(val);
            if (sanitized !== val) setFieldErrors((prev) => ({ ...prev, identifier: t("auth.validation.usernameInvalidChars") }));
            val = sanitized;
          }
          onChange(val);
          if (!val.trim()) {
            setFieldErrors((prev) => ({ ...prev, identifier: t("auth.validation.identifierRequired") }));
            return;
          }
          if (val.includes("@") && !isValidEmail(val.trim())) {
            setFieldErrors((prev) => ({ ...prev, identifier: t("auth.validation.invalidEmail") }));
            return;
          }
          if (!val.includes("@") && val.trim().length < 3) {
            setFieldErrors((prev) => ({ ...prev, identifier: t("auth.validation.usernameTooShort") }));
            return;
          }
          setFieldErrors((prev) => ({ ...prev, identifier: undefined }));
        }}
        type="text"
        placeholder={isLogin ? t("auth.validation.identifierPlaceholderLogin") : t("auth.validation.identifierPlaceholderRegister")}
        className={`w-full pl-10 pr-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:bg-background transition ${
          error ? "border-red-500 focus:ring-red-400 animate-shake" : "border-input focus:ring-ring"
        }`}
        autoComplete="username"
        required
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
