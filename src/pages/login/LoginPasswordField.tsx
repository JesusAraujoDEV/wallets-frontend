import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

export function LoginPasswordField({ value, onChange, error, isLogin }: {
  value: string; onChange: (v: string) => void; error?: string; isLogin: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Lock className="absolute left-3 top-3 text-muted-foreground h-5 w-5" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={visible ? "text" : "password"}
        placeholder="Contraseña"
        className={`w-full pl-10 pr-10 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:bg-background transition ${
          error ? "border-red-500 focus:ring-red-400 animate-shake" : "border-input focus:ring-ring"
        }`}
        autoComplete={isLogin ? "current-password" : "new-password"}
        required
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        tabIndex={-1}
      >
        {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
