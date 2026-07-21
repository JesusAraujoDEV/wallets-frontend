import type { CredentialResponse } from "@react-oauth/google";
import type { TFunction } from "i18next";
import { AuthApi, type AuthSession } from "@/lib/auth";
import { persistSession } from "@/lib/authSession";
import { parseBackendMessage, getReadableError } from "@/lib/authErrorMessages";

export function createGoogleLoginHandler({ setLoading, onSuccess, toast, t }: {
  setLoading: (v: boolean) => void;
  onSuccess?: (session: AuthSession) => void | Promise<void>;
  toast: (opts: { title: string; description: string; variant?: "destructive" }) => void;
  t: TFunction;
}) {
  return async function handleGoogleSuccess(credentialResponse: CredentialResponse) {
    const cred = credentialResponse.credential;
    if (!cred) {
      toast({ title: t("auth.login.googleFailedTitle"), description: t("auth.login.googleNoCredential"), variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      const session = await AuthApi.googleLogin(cred);
      persistSession(session);
      toast({ title: t("auth.login.welcomeTitle"), description: t("auth.login.sessionStarted", { username: session.user.username }) });
      if (onSuccess) {
        await onSuccess(session);
        return;
      }
      window.location.href = "/";
    } catch (err: any) {
      const backendMessage = parseBackendMessage(err);
      const friendly = getReadableError(backendMessage || err?.message || "", t);
      toast({ title: t("auth.login.googleFailedTitle"), description: friendly, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
}
