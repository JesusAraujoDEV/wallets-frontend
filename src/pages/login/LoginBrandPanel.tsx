import { AnimatePresence, motion } from "framer-motion";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

function authPanelCopy(isLogin: boolean, t: TFunction) {
  return {
    title: isLogin ? t("auth.brand.titleLogin") : t("auth.brand.titleRegister"),
    description: isLogin ? t("auth.brand.descriptionLogin") : t("auth.brand.descriptionRegister"),
  };
}

export function LoginBrandPanel({ isLogin }: { isLogin: boolean }) {
  const { t } = useTranslation();
  const copy = authPanelCopy(isLogin, t);
  return (
    <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-emerald-600 to-teal-800 p-12 flex-col justify-between text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-foreground/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />

      <div className="z-10">
        <div className="text-3xl font-bold tracking-wider">{t("auth.brand.name")}</div>
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

      <div className="z-10 text-sm text-emerald-200">{t("auth.brand.footer")}</div>
    </div>
  );
}
