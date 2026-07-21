import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { AuthSession } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { LoginBrandPanel } from "@/pages/login/LoginBrandPanel";
import { LoginGoogleButton } from "@/pages/login/LoginGoogleButton";
import { LoginIdentifierField } from "@/pages/login/LoginIdentifierField";
import { LoginPasswordField } from "@/pages/login/LoginPasswordField";
import { LoginRegisterFields } from "@/pages/login/LoginRegisterFields";
import { createGoogleLoginHandler } from "@/pages/login/googleLoginHandler";
import { createSubmitHandler } from "@/pages/login/loginSubmitHandler";
import type { FieldErrors } from "@/pages/login/types";

type LoginProps = {
  onSuccess?: (session: AuthSession) => void | Promise<void>;
  customTitle?: string;
  hideNavigation?: boolean;
};

export default function Login({ onSuccess, customTitle, hideNavigation }: LoginProps) {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const { toast } = useToast();

  const handleGoogleSuccess = createGoogleLoginHandler({ setLoading, onSuccess, toast, t });
  const onSubmit = createSubmitHandler({
    values: { isLogin, name, email, usernameOrEmail, password },
    setLoading, setFieldErrors, toast, onSuccess, t,
  });

  return (
    <div className="min-h-screen w-full flex bg-background">
      <LoginBrandPanel isLogin={isLogin} />

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-card text-card-foreground p-8 rounded-2xl shadow-xl lg:shadow-none">
          <div className="text-center mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? "header-login" : "header-register"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-2xl font-bold text-card-foreground mb-2">{customTitle ?? (isLogin ? t("auth.login.titleLogin") : t("auth.login.titleRegister"))}</h3>
                <p className="text-muted-foreground text-sm">{isLogin ? t("auth.login.subtitleLogin") : t("auth.login.subtitleRegister")}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mb-6 flex justify-center">
            <LoginGoogleButton
              isLogin={isLogin}
              onSuccess={handleGoogleSuccess}
              onError={() => toast({ title: t("auth.login.googleFailedTitle"), description: t("auth.login.googleFailedDescription"), variant: "destructive" })}
            />
          </div>

          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-border" />
            <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs uppercase">{t("auth.login.orDivider")}</span>
            <div className="flex-grow border-t border-border" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {!isLogin && (
              <LoginRegisterFields
                name={name} onNameChange={setName}
                email={email} onEmailChange={setEmail}
                fieldErrors={fieldErrors} setFieldErrors={setFieldErrors}
              />
            )}

            <LoginIdentifierField
              value={usernameOrEmail} onChange={setUsernameOrEmail}
              error={fieldErrors.identifier} setFieldErrors={setFieldErrors} isLogin={isLogin}
            />

            <LoginPasswordField
              value={password} onChange={setPassword} error={fieldErrors.password} isLogin={isLogin}
            />

            {isLogin && (
              <div className="mt-1 flex justify-end">
                <Link to="/forgot-password" className="text-sm text-emerald-600 hover:underline">
                  {t("auth.login.forgotPassword")}
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:hover:bg-primary text-primary-foreground font-bold py-3 rounded-lg transition duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (isLogin ? t("auth.login.submitLoading") : t("auth.login.submitCreating")) : isLogin ? t("auth.login.submitLogin") : t("auth.login.submitRegister")}
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>

          {!hideNavigation && (
            <div className="mt-8 text-center">
              <p className="text-muted-foreground text-sm">
                {isLogin ? t("auth.login.noAccount") : t("auth.login.haveAccount")}
                <button type="button" onClick={() => setIsLogin((v) => !v)} className="text-emerald-600 font-bold hover:underline">
                  {isLogin ? t("auth.login.registerHere") : t("auth.login.loginHere")}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
