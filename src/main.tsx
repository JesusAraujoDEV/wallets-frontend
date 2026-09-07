import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.tsx";
import "./index.css";
import "./lib/i18n";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

// A route's lazy chunk can 404 after a new deploy ships new chunk hashes
// while this tab still has the old index.html in memory. Vite emits this
// event when that dynamic import fails; reload once to pick up the new
// build instead of leaving the user on a page that never finishes loading.
window.addEventListener("vite:preloadError", () => {
	window.location.reload();
});

createRoot(document.getElementById("root")!).render(
	googleClientId ? (
		<GoogleOAuthProvider clientId={googleClientId}>
			<App />
		</GoogleOAuthProvider>
	) : (
		<App />
	)
);
