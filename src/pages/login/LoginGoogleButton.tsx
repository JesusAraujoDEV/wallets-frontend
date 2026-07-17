import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";

export function LoginGoogleButton({ isLogin, onSuccess, onError }: {
  isLogin: boolean;
  onSuccess: (cred: CredentialResponse) => void;
  onError: () => void;
}) {
  const configured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  if (!configured) {
    return (
      <button
        type="button"
        disabled
        className="h-11 rounded-lg bg-muted text-muted-foreground text-sm font-semibold border border-border px-5"
        title="Configura VITE_GOOGLE_CLIENT_ID para habilitar Google"
      >
        Continuar con Google (no configurado)
      </button>
    );
  }
  return (
    <GoogleLogin
      onSuccess={onSuccess}
      onError={onError}
      theme="filled_blue"
      size="large"
      text={isLogin ? "signin_with" : "signup_with"}
      shape="rectangular"
    />
  );
}
