import { useMemo, useState } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, AtSign, Lock, Mail, User } from "lucide-react";
import { AuthApi, type AuthSession } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";

type LoginProps = {
  onSuccess?: (session: AuthSession) => void | Promise<void>;
  customTitle?: string;
  hideNavigation?: boolean;
};

function authPanelCopy(isLogin: boolean) {
  return {
    title: isLogin ? "Bienvenido a tu\nLibertad Financiera." : "Únete al\nTeam Aura.",
    description: isLogin
      ? "Tus finanzas claras, tus metas cerca. Entra y mira cómo crece tu imperio."
      : "El primer paso para dominar tu dinero empieza aquí. Es simple, rápido y seguro.",
  };
}

export default function Login({ onSuccess, customTitle, hideNavigation }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; email?: string; password?: string }>({});
  const { toast } = useToast();

  const googleClientIdConfigured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const copy = useMemo(() => authPanelCopy(isLogin), [isLogin]);

  function isEmail(value: string) {
    return /\S+@\S+\.\S+/.test(value);
  }

  function getReadableError(message: string) {
    const raw = message.toLowerCase();
    if (raw.includes("401") || raw.includes("unauthorized")) return "Credenciales incorrectas. Intenta de nuevo.";
    if (raw.includes("404") || raw.includes("not found")) return "No encontramos una cuenta con esos datos.";
    if (raw.includes("409") || raw.includes("conflict")) return "Ese usuario o correo ya está registrado.";
    if (raw.includes("string.min") && raw.includes("username")) return "El usuario debe tener al menos 3 caracteres.";
    if (raw.includes("username") && raw.includes("required")) return "Por favor, escribe tu nombre de usuario.";
    if (raw.includes("string.email") || raw.includes("email") && raw.includes("valid")) return "Ese correo no parece válido. Revisa el @.";
    if (raw.includes("string.min") && raw.includes("password")) return "La contraseña es muy corta (mínimo 6 caracteres).";
    if (raw.includes("email") && raw.includes("required")) return "Por favor, escribe tu correo electrónico.";
    return "Ocurrió un error. Intenta nuevamente.";
  }

  function parseBackendMessage(err: any) {
    const msg = err?.message || "";
    if (!msg) return "";
    try {
      const asJson = JSON.parse(msg);
      if (asJson?.message) return String(asJson.message);
    } catch {
      // ignore
    }
    return msg;
  }

  async function handleGoogleSuccess(credentialResponse: CredentialResponse) {
    const cred = credentialResponse.credential;
    if (!cred) {
      console.error("❌ Google no entregó el token. Revisa la configuración de Orígenes en GCP.");
      toast({ title: "Google Login fallido", description: "No se recibió credencial de Google", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      console.log("🔐 Token recibido, enviando al backend...");
      console.log("📤 Payload Google -> Backend:", { token: cred });
      const session = await AuthApi.googleLogin(cred);
      console.log("📥 Respuesta Backend (sesión):", session);
      try {
        localStorage.setItem("pwi_token", session.token);
        localStorage.setItem("token", session.token);
        localStorage.setItem("user", JSON.stringify(session.user));
        console.log("🧾 pwi_token guardado:", localStorage.getItem("pwi_token"));
      } catch {
        // ignore storage errors
      }
      toast({ title: "Bienvenido", description: `Sesión iniciada como ${session.user.username}` });
      if (onSuccess) {
        await onSuccess(session);
        return;
      }
      window.location.href = "/";
    } catch (err: any) {
      toast({
        title: "Google Login fallido",
        description: err?.message || "No fue posible iniciar sesión con Google",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    if (!usernameOrEmail.trim()) {
      setFieldErrors({ identifier: "Por favor, escribe tu usuario o correo electrónico." });
      toast({ title: "Falta el usuario", description: "Ingresa tu usuario o correo" , variant: "destructive" });
      return;
    }
    if (!password) {
      setFieldErrors({ password: "Por favor, escribe tu contraseña." });
      toast({ title: "Falta la contraseña", description: "Ingresa tu contraseña" , variant: "destructive" });
      return;
    }
    if (!isLogin && !email.trim()) {
      setFieldErrors({ email: "Por favor, escribe tu correo electrónico." });
      toast({ title: "Falta el email", description: "Ingresa tu correo electrónico" , variant: "destructive" });
      return;
    }
    if (isLogin && usernameOrEmail.includes("@") && !isEmail(usernameOrEmail.trim())) {
      setFieldErrors({ identifier: "Ese correo no parece válido. Revisa el @." });
      toast({ title: "Correo inválido", description: "Ese correo no parece válido. Revisa el @." , variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      if (isLogin) {
        const identifier = usernameOrEmail.trim();
        const session = await AuthApi.login({
          password,
          ...(identifier.includes("@") ? { email: identifier } : { username: identifier }),
        });
        try {
          localStorage.setItem("pwi_token", session.token);
          localStorage.setItem("token", session.token);
          localStorage.setItem("user", JSON.stringify(session.user));
        } catch {
          // ignore storage errors
        }
        toast({ title: "Bienvenido", description: `Sesión iniciada como ${session.user.username}` });
        if (onSuccess) {
          await onSuccess(session);
          return;
        }
      } else {
        const session = await AuthApi.register({
          username: usernameOrEmail.trim(),
          password,
          name: name.trim() || undefined,
          email: email.trim(),
        });
        try {
          localStorage.setItem("pwi_token", session.token);
          localStorage.setItem("token", session.token);
          localStorage.setItem("user", JSON.stringify(session.user));
        } catch {
          // ignore storage errors
        }
        toast({ title: "Cuenta creada", description: "Registro completado" });
        if (onSuccess) {
          await onSuccess(session);
          return;
        }
      }
      window.location.href = "/";
    } catch (err: any) {
      const backendMessage = parseBackendMessage(err);
      const friendly = getReadableError(backendMessage || err?.message || "");
      if (backendMessage.toLowerCase().includes("password")) {
        setFieldErrors({ password: friendly });
      } else if (backendMessage.toLowerCase().includes("email")) {
        setFieldErrors({ email: friendly });
      } else if (backendMessage.toLowerCase().includes("username")) {
        setFieldErrors({ identifier: friendly });
      }
      toast({
        title: isLogin ? "Login fallido" : "Registro fallido",
        description: friendly,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-gray-50">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-emerald-600 to-teal-800 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />

        <div className="z-10">
          <div className="text-3xl font-bold tracking-wider">Wallets.</div>
        </div>

        <div className="z-10 mb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "copy-login" : "copy-register"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-5xl font-bold mb-6 leading-tight whitespace-pre-line">{copy.title}</h2>
              <p className="text-emerald-100 text-lg max-w-md">{copy.description}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="z-10 text-sm text-emerald-200">© 2026 Iris Software. Secure Environment.</div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl lg:shadow-none">
          <div className="text-center mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? "header-login" : "header-register"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{customTitle ?? (isLogin ? "Hola de nuevo" : "Crear cuenta")}</h3>
                <p className="text-gray-500 text-sm">{isLogin ? "Ingresa tus datos para continuar" : "Regístrate gratis en segundos"}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mb-6 flex justify-center">
            <div className="w-full">
              {googleClientIdConfigured ? (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() =>
                    toast({ title: "Google Login fallido", description: "No fue posible autenticar con Google", variant: "destructive" })
                  }
                  theme="filled_blue"
                  size="large"
                  text={isLogin ? "signin_with" : "signup_with"}
                  shape="rectangular"
                />
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full h-11 rounded-lg bg-gray-100 text-gray-500 text-sm font-semibold border border-gray-200"
                  title="Configura VITE_GOOGLE_CLIENT_ID para habilitar Google"
                >
                  Continuar con Google (no configurado)
                </button>
              )}
            </div>
          </div>

          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-200" />
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">O usa tus credenciales</span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <AnimatePresence mode="popLayout" initial={false}>
              {!isLogin && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <User className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    placeholder="Nombre completo"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    autoComplete="name"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {!isLogin && (
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Correo electrónico"
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition ${
                    fieldErrors.email ? "border-red-500 focus:ring-red-400 animate-shake" : "border-gray-200 focus:ring-emerald-500"
                  }`}
                  autoComplete="email"
                  required
                />
                {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
              </div>
            )}

            <div className="relative">
              <AtSign className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
              <input
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                type="text"
                placeholder={isLogin ? "Ingresa tu usuario o correo electrónico" : "Nombre de usuario"}
                className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition ${
                  fieldErrors.identifier ? "border-red-500 focus:ring-red-400 animate-shake" : "border-gray-200 focus:ring-emerald-500"
                }`}
                autoComplete="username"
                required
              />
              {fieldErrors.identifier && <p className="mt-1 text-xs text-red-500">{fieldErrors.identifier}</p>}
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Contraseña"
                className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition ${
                  fieldErrors.password ? "border-red-500 focus:ring-red-400 animate-shake" : "border-gray-200 focus:ring-emerald-500"
                }`}
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
              />
              {fieldErrors.password && <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-black disabled:opacity-60 disabled:hover:bg-gray-900 text-white font-bold py-3 rounded-lg transition duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (isLogin ? "Entrando..." : "Creando...") : isLogin ? "Entrar" : "Registrarse"}
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>

          {!hideNavigation && (
            <div className="mt-8 text-center">
              <p className="text-gray-600 text-sm">
                {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
                <button
                  type="button"
                  onClick={() => setIsLogin((v) => !v)}
                  className="text-emerald-600 font-bold hover:underline"
                >
                  {isLogin ? "Regístrate aquí" : "Inicia sesión"}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
