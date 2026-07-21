import type { TFunction } from "i18next";
import { AuthApi, type AuthSession } from "@/lib/auth";
import { persistSession } from "@/lib/authSession";
import { parseBackendMessage, getReadableError } from "@/lib/authErrorMessages";
import { isValidEmail, sanitizeUsernameInput } from "@/lib/validation";
import type { FieldErrors } from "./types";

export type LoginFormValues = {
  isLogin: boolean; name: string; email: string; usernameOrEmail: string; password: string;
};

export function createSubmitHandler({ values, setLoading, setFieldErrors, toast, onSuccess, t }: {
  values: LoginFormValues;
  setLoading: (v: boolean) => void;
  setFieldErrors: (v: FieldErrors) => void;
  toast: (opts: { title: string; description: string; variant?: "destructive" }) => void;
  onSuccess?: (session: AuthSession) => void | Promise<void>;
  t: TFunction;
}) {
  return async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { isLogin, name, email, usernameOrEmail, password } = values;
    setFieldErrors({});
    if (!usernameOrEmail.trim()) {
      const msg = t("auth.validation.identifierRequired");
      setFieldErrors({ identifier: msg });
      toast({ title: t("auth.validation.identifierRequiredTitle"), description: msg, variant: "destructive" });
      return;
    }
    if (!password) {
      const msg = t("auth.validation.passwordRequired");
      setFieldErrors({ password: msg });
      toast({ title: t("auth.validation.passwordRequiredTitle"), description: msg, variant: "destructive" });
      return;
    }
    if (!isLogin && !email.trim()) {
      const msg = t("auth.validation.emailRequired");
      setFieldErrors({ email: msg });
      toast({ title: t("auth.validation.emailRequiredTitle"), description: msg, variant: "destructive" });
      return;
    }
    if (isLogin && usernameOrEmail.includes("@") && !isValidEmail(usernameOrEmail.trim())) {
      const msg = t("auth.validation.invalidEmail");
      setFieldErrors({ identifier: msg });
      toast({ title: t("auth.validation.invalidEmailTitle"), description: msg, variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      let session: AuthSession;
      if (isLogin) {
        const identifier = usernameOrEmail.trim();
        const normalizedIdentifier = identifier.includes("@") ? identifier : sanitizeUsernameInput(identifier);
        session = await AuthApi.login({
          password,
          ...(identifier.includes("@") ? { email: identifier } : { username: normalizedIdentifier }),
        });
        toast({ title: t("auth.login.welcomeTitle"), description: t("auth.login.sessionStarted", { username: session.user.username }) });
      } else {
        session = await AuthApi.register({
          username: sanitizeUsernameInput(usernameOrEmail.trim()),
          password,
          name: name.trim() || undefined,
          email: email.trim(),
        });
        toast({ title: t("auth.login.accountCreatedTitle"), description: t("auth.login.registrationComplete") });
      }
      persistSession(session);
      if (onSuccess) {
        await onSuccess(session);
        return;
      }
      window.location.href = "/";
    } catch (err: any) {
      const backendMessage = parseBackendMessage(err);
      const friendly = getReadableError(backendMessage || err?.message || "", t);
      const lower = backendMessage.toLowerCase();
      if (lower.includes("password")) setFieldErrors({ password: friendly });
      else if (lower.includes("email")) setFieldErrors({ email: friendly });
      else if (lower.includes("name")) setFieldErrors({ name: friendly });
      else if (lower.includes("username")) setFieldErrors({ identifier: friendly });
      else if (lower.includes("value") || lower.includes("usuario/email")) setFieldErrors({ identifier: friendly });
      toast({ title: isLogin ? t("auth.login.failedTitle") : t("auth.login.registerFailedTitle"), description: friendly, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
}
