import { AnimatePresence, motion } from "framer-motion";
import { Mail, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { isValidEmail, sanitizeEmailInput, sanitizeNameInput } from "@/lib/validation";
import type { FieldErrors } from "./types";

export function LoginRegisterFields({ name, onNameChange, email, onEmailChange, fieldErrors, setFieldErrors }: {
  name: string; onNameChange: (v: string) => void;
  email: string; onEmailChange: (v: string) => void;
  fieldErrors: FieldErrors; setFieldErrors: (updater: (prev: FieldErrors) => FieldErrors) => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key="name"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="relative"
        >
          <User className="absolute left-3 top-3 text-muted-foreground h-5 w-5" />
          <input
            value={name}
            onChange={(e) => {
              const raw = e.target.value;
              const sanitized = sanitizeNameInput(raw);
              setFieldErrors((prev) => ({ ...prev, name: sanitized !== raw ? t("auth.validation.nameInvalidChars") : undefined }));
              onNameChange(sanitized);
            }}
            type="text"
            placeholder={t("auth.validation.namePlaceholder")}
            className={`w-full pl-10 pr-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background transition ${
              fieldErrors.name ? "border-red-500 animate-shake" : "border-input"
            }`}
            autoComplete="name"
          />
          {fieldErrors.name && <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>}
        </motion.div>
      </AnimatePresence>

      <div className="relative">
        <Mail className="absolute left-3 top-3 text-muted-foreground h-5 w-5" />
        <input
          value={email}
          onChange={(e) => {
            const raw = e.target.value;
            const sanitized = sanitizeEmailInput(raw);
            if (sanitized !== raw) setFieldErrors((prev) => ({ ...prev, email: t("auth.validation.emailInvalidChars") }));
            onEmailChange(sanitized);
            if (!sanitized.trim()) {
              setFieldErrors((prev) => ({ ...prev, email: t("auth.validation.emailRequired") }));
              return;
            }
            if (!isValidEmail(sanitized.trim())) {
              setFieldErrors((prev) => ({ ...prev, email: t("auth.validation.invalidEmail") }));
              return;
            }
            setFieldErrors((prev) => ({ ...prev, email: undefined }));
          }}
          type="email"
          placeholder={t("auth.validation.emailPlaceholder")}
          className={`w-full pl-10 pr-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:bg-background transition ${
            fieldErrors.email ? "border-red-500 focus:ring-red-400 animate-shake" : "border-input focus:ring-ring"
          }`}
          autoComplete="email"
          required
        />
        {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
      </div>
    </>
  );
}
