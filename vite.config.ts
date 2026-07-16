import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.PORT) || 8080;

  return {
    server: {
      host: "::",
      port,
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico", "icons/apple-touch-icon.png"],
        manifest: {
          name: "Platica — Tracker Financiero Personal",
          short_name: "Platica",
          description: "Registra transacciones, cuentas, presupuestos y deudas, con tasas BCV en tiempo real.",
          lang: "es",
          start_url: "/",
          display: "standalone",
          background_color: "#0b1218",
          theme_color: "#10b981",
          icons: [
            { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
            { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
            { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          ],
        },
        workbox: {
          // App shell precache only — financial data is always fetched live,
          // never served stale from cache.
          globPatterns: ["**/*.{js,css,html,ico,svg,png}"],
          navigateFallbackDenylist: [/^\/api\//],
          // ponytail: single un-split JS bundle is ~2.4MB; raise the precache
          // limit rather than code-split under this task's scope. Revisit if
          // the audit's bundle-splitting recommendation gets picked up.
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        },
        devOptions: {
          enabled: false,
        },
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
