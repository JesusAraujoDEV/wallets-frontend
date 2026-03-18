import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { AuthApi } from "@/lib/auth";
import type { AuthProfileResponse } from "@/lib/types";
import { Loader2, LogOut, Mail, UserCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 break-words text-base font-medium text-slate-950">{value}</p>
    </div>
  );
}

export default function Profile() {
  const [user, setUser] = useState<AuthProfileResponse["user"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const response = await AuthApi.me();
        if (alive) {
          setUser(response.user);
        }
      } catch (error) {
        if (alive) {
          toast({
            title: "No se pudo cargar el perfil",
            description: error instanceof Error ? error.message : "Intenta nuevamente.",
            variant: "destructive",
          });
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [toast]);

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await AuthApi.logout();
      navigate("/login", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <UserCircle2 className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-950">Perfil</CardTitle>
              <CardDescription>Consulta tus datos de sesión y gestiona el cierre de sesión desde una vista dedicada.</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex min-h-40 items-center justify-center text-slate-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Cargando perfil...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <ProfileField label="Nombre" value={user?.name || "No disponible"} />
              <ProfileField label="Email" value={user?.email || "No disponible"} />
              <ProfileField label="Username" value={user?.username || "No disponible"} />
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <div className="flex items-center gap-2 font-medium text-slate-900">
              <Mail className="h-4 w-4" />
              Estado de cuenta
            </div>
            <p className="mt-2">
              Tu información se obtiene desde <span className="font-medium">AuthApi.me()</span> y permanece protegida dentro del bloque privado del router.
            </p>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
            <Button variant="destructive" onClick={handleLogout} disabled={loggingOut || loading}>
              {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              Cerrar sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}