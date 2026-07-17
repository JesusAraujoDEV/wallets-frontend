import type { CredentialResponse } from "@react-oauth/google";
import { AuthApi, type AuthSession } from "@/lib/auth";
import { persistSession } from "@/lib/authSession";
import { parseBackendMessage, getReadableError } from "@/lib/authErrorMessages";

export function createGoogleLoginHandler({ setLoading, onSuccess, toast }: {
  setLoading: (v: boolean) => void;
  onSuccess?: (session: AuthSession) => void | Promise<void>;
  toast: (opts: { title: string; description: string; variant?: "destructive" }) => void;
}) {
  return async function handleGoogleSuccess(credentialResponse: CredentialResponse) {
    const cred = credentialResponse.credential;
    if (!cred) {
      toast({ title: "Google Login fallido", description: "No se recibió credencial de Google", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      const session = await AuthApi.googleLogin(cred);
      persistSession(session);
      toast({ title: "Bienvenido", description: `Sesión iniciada como ${session.user.username}` });
      if (onSuccess) {
        await onSuccess(session);
        return;
      }
      window.location.href = "/";
    } catch (err: any) {
      const backendMessage = parseBackendMessage(err);
      const friendly = getReadableError(backendMessage || err?.message || "");
      toast({ title: "Google Login fallido", description: friendly, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
}
