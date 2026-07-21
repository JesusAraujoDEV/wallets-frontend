import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, MessageCircle, ArrowRight, Link2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Login from "./Login";
import { apiFetch, getToken } from "@/lib/http";

const BOT_LINK = "https://t.me/WalletsAuraBot";

type Step = "choice" | "auth" | "linking" | "success" | "error" | "missing";

export default function TelegramLogin() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const chatId = params.get("chat_id");
  const username = params.get("username");
  const [step, setStep] = useState<Step>("auth");
  const [error, setError] = useState<string | null>(null);
  const linkingRef = useRef(false);

  async function handleLink() {
    if (!chatId) {
      setStep("missing");
      return;
    }
    if (linkingRef.current) return;
    linkingRef.current = true;
    setStep("linking");
    try {
      await apiFetch("telegram/link", {
        method: "POST",
        body: JSON.stringify({ chatId, username: username || " " }),
      });
      setStep("success");
    } catch (err: any) {
      setError(err?.message || t("auth.telegram.linkFailedFallback"));
      setStep("error");
    } finally {
      linkingRef.current = false;
    }
  }

  useEffect(() => {
    if (!chatId) {
      setStep("missing");
      return;
    }
    const token = getToken();
    if (token) {
      setStep("choice");
      return;
    }
    setStep("auth");
  }, [chatId]);

  if (step === "success") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle className="w-12 h-12 text-emerald-600" />
        </motion.div>

        <h1 className="text-3xl font-bold text-foreground mb-2">{t("auth.telegram.successTitle")}</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          {t("auth.telegram.successDescription")}{username ? (
            <>
              , <span className="font-semibold">{username}</span>
            </>
          ) : null}.
        </p>

        <a
          href={BOT_LINK}
          className="bg-[#24A1DE] hover:bg-[#1d8bc3] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-all transform hover:-translate-y-1 shadow-lg shadow-blue-200"
        >
          <MessageCircle className="w-6 h-6" /> {t("auth.telegram.backToBot")}
        </a>

        <a href="/dashboard" className="mt-6 text-sm text-muted-foreground hover:text-foreground underline">
          {t("auth.telegram.goToDashboard")}
        </a>
      </div>
    );
  }

  if (step === "choice") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6"
        >
          <MessageCircle className="w-10 h-10 text-emerald-600" />
        </motion.div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{t("auth.telegram.choiceTitle")}</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          {t("auth.telegram.choiceDescription")}
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleLink}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-3 transition-all"
          >
            <CheckCircle className="w-5 h-5" /> {t("auth.telegram.connectButton")}
          </button>
          <button
            onClick={() => setStep("auth")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-semibold flex items-center gap-3 transition-all"
          >
            <ArrowRight className="w-5 h-5" /> {t("auth.telegram.switchAccount")}
          </button>
        </div>
      </div>
    );
  }

  if (step === "linking") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin mb-6"
        />
        <h1 className="text-2xl font-bold text-foreground mb-2">{t("auth.telegram.linkingTitle")}</h1>
        <p className="text-muted-foreground">{t("auth.telegram.linkingDescription")}</p>
      </div>
    );
  }

  if (step === "missing") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6">
          <Link2 className="w-12 h-12 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{t("auth.telegram.missingChatIdTitle")}</h1>
        <p className="text-muted-foreground mb-6">{t("auth.telegram.missingChatIdDescription")}</p>
        <a href={BOT_LINK} className="text-emerald-600 font-semibold hover:underline">
          {t("auth.telegram.backToBotPlain")}
        </a>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mb-6">
          <ArrowRight className="w-12 h-12 text-rose-600 rotate-180" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{t("auth.telegram.errorTitle")}</h1>
        <p className="text-muted-foreground mb-6">{error ?? t("auth.telegram.errorFallback")}</p>
        <button
          onClick={handleLink}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition"
        >
          {t("auth.telegram.retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Login
        customTitle={t("auth.telegram.customTitle")}
        onSuccess={() => handleLink()}
      />
    </div>
  );
}
