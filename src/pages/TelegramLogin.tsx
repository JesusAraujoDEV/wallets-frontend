import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, MessageCircle, ArrowRight, Link2 } from "lucide-react";
import { motion } from "framer-motion";
import Login from "./Login";
import { apiFetch, getToken } from "@/lib/http";

const BOT_LINK = "https://t.me/WalletsAuraBot";

type Step = "auth" | "linking" | "success" | "error" | "missing";

export default function TelegramLogin() {
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
        body: JSON.stringify({ chatId, telegramUsername: username || undefined }),
      });
      setStep("success");
    } catch (err: any) {
      setError(err?.message || "No se pudo vincular el chat.");
      setStep("error");
    } finally {
      linkingRef.current = false;
    }
  }

  useEffect(() => {
    const token = getToken();
    if (token && chatId) {
      handleLink();
    }
  }, [chatId]);

  if (step === "success") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle className="w-12 h-12 text-emerald-600" />
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Sincronización Completada!</h1>
        <p className="text-gray-500 mb-8 max-w-md">
          Tu cuenta de Wallets ahora está conectada con Telegram{username ? (
            <>
              , <span className="font-semibold">{username}</span>
            </>
          ) : null}.
        </p>

        <a
          href={BOT_LINK}
          className="bg-[#24A1DE] hover:bg-[#1d8bc3] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-all transform hover:-translate-y-1 shadow-lg shadow-blue-200"
        >
          <MessageCircle className="w-6 h-6" /> Volver al Bot 🤖
        </a>

        <a href="/dashboard" className="mt-6 text-sm text-gray-400 hover:text-gray-600 underline">
          Ir a mi Dashboard
        </a>
      </div>
    );
  }

  if (step === "linking") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin mb-6"
        />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Vinculando tu cuenta...</h1>
        <p className="text-gray-500">No cierres esta ventana.</p>
      </div>
    );
  }

  if (step === "missing") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6">
          <Link2 className="w-12 h-12 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Falta el chat_id</h1>
        <p className="text-gray-500 mb-6">Regresa al bot para generar el enlace correcto.</p>
        <a href={BOT_LINK} className="text-emerald-600 font-semibold hover:underline">
          Volver al Bot
        </a>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mb-6">
          <ArrowRight className="w-12 h-12 text-rose-600 rotate-180" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">No pudimos vincular tu cuenta</h1>
        <p className="text-gray-500 mb-6">{error ?? "Inténtalo nuevamente."}</p>
        <button
          onClick={handleLink}
          className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-black transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Login
        customTitle="Conecta tu cuenta para continuar"
        hideNavigation
        onSuccess={() => handleLink()}
      />
    </div>
  );
}
