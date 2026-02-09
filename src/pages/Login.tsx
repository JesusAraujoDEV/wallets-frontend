import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import { AuthApi } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";

const USERNAME_SUGGESTIONS = ["JesuAura", "PepoAura", "GaboAura", "CarluchoAura", "DavidAura", "CesarAura"];

function authPanelCopy(isLogin: boolean) {
  return {
    title: isLogin ? "Bienvenido a tu\nLibertad Financiera." : "Únete al\nTeam Aura.",
    description: isLogin
      ? "Tus finanzas claras, tus metas cerca. Entra y mira cómo crece tu imperio."
      : "El primer paso para dominar tu dinero empieza aquí. Es simple, rápido y seguro.",
  };
}

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const googleClientIdConfigured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const copy = useMemo(() => authPanelCopy(isLogin), [isLogin]);

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
      try {
        localStorage.setItem("token", session.token);
        localStorage.setItem("user", JSON.stringify(session.user));
      } catch {
        // ignore storage errors
      }
      toast({ title: "Bienvenido", description: `Sesión iniciada como ${session.user.username}` });
      navigate("/", { replace: true });
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
    if (!usernameOrEmail.trim()) {
      toast({ title: "Falta el usuario", description: "Ingresa tu usuario o correo" , variant: "destructive" });
      return;
    }
    if (!password) {
      toast({ title: "Falta la contraseña", description: "Ingresa tu contraseña" , variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      if (isLogin) {
        const session = await AuthApi.login(usernameOrEmail.trim(), password);
        try {
          localStorage.setItem("token", session.token);
          localStorage.setItem("user", JSON.stringify(session.user));
        } catch {
          // ignore storage errors
        }
        toast({ title: "Bienvenido", description: `Sesión iniciada como ${session.user.username}` });
      } else {
        const session = await AuthApi.register({ username: usernameOrEmail.trim(), password, name: name.trim() || undefined });
        try {
          localStorage.setItem("token", session.token);
          localStorage.setItem("user", JSON.stringify(session.user));
        } catch {
          // ignore storage errors
        }
        toast({ title: "Cuenta creada", description: "Registro completado" });
      }
      navigate("/", { replace: true });
    } catch (err: any) {
      toast({
        title: isLogin ? "Login fallido" : "Registro fallido",
        description: err?.message || (isLogin ? "Usuario o contraseña incorrectos" : "No se pudo crear la cuenta"),
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
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{isLogin ? "Hola de nuevo" : "Crear cuenta"}</h3>
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

            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
              <input
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                type="text"
                placeholder="Usuario o correo"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                autoComplete={isLogin ? "username" : "email"}
                list="username-suggestions"
                required
              />
              <datalist id="username-suggestions">
                {USERNAME_SUGGESTIONS.map((u) => (
                  <option key={u} value={u} />
                ))}
              </datalist>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Contraseña"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
              />
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
        </div>
      </div>
    </div>
  );
}
