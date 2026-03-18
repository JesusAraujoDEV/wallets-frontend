import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { AuthApi } from "@/lib/auth";
import type { AuthProfileResponse } from "@/lib/types";
import { Loader2, PencilLine } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

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
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<{ name: string; email: string; username: string }>({
    defaultValues: {
      name: "",
      email: "",
      username: "",
    },
  });

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const response = await AuthApi.me();
        if (alive) {
          setUser(response.user);
          reset({
            name: response.user.name || "",
            email: response.user.email || "",
            username: response.user.username || "",
          });
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
  }, [toast, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (!user) return;

    const nextName = values.name.trim();
    const nextEmail = values.email.trim();
    const nextUsername = values.username.trim();

    const payload = {
      ...(nextName !== user.name ? { name: nextName } : {}),
      ...(nextEmail !== user.email ? { email: nextEmail } : {}),
      ...(nextUsername !== user.username ? { username: nextUsername } : {}),
    };

    if (Object.keys(payload).length === 0) {
      setIsEditing(false);
      toast({ title: "Sin cambios", description: "No hay datos nuevos para actualizar." });
      return;
    }

    try {
      const updatedUser = await AuthApi.updateProfile(payload);
      setUser(updatedUser);
      reset({
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        username: updatedUser.username || "",
      });
      setIsEditing(false);
      toast({ title: "Perfil actualizado", description: "Tus datos se guardaron correctamente." });
    } catch (error) {
      toast({
        title: "No se pudo actualizar el perfil",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    }
  });

  const userInitials = (user?.name || user?.username || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14 border border-emerald-100 bg-emerald-50 text-emerald-700">
                <AvatarFallback className="bg-emerald-50 text-base font-semibold text-emerald-700">{userInitials || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl text-slate-950">Perfil</CardTitle>
                <CardDescription>Consulta tus datos personales y mantiene tu informacion al dia.</CardDescription>
              </div>
            </div>

            {!isEditing ? (
              <Button variant="outline" className="w-full gap-2 sm:w-auto" onClick={() => setIsEditing(true)} disabled={loading}>
                <PencilLine className="h-4 w-4" />
                Editar perfil
              </Button>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex min-h-40 items-center justify-center text-slate-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Cargando perfil...
            </div>
          ) : !isEditing ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <ProfileField label="Nombre" value={user?.name || "No disponible"} />
              <ProfileField label="Email" value={user?.email || "No disponible"} />
              <ProfileField label="Username" value={user?.username || "No disponible"} />
            </div>
          ) : (
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="profile-name">Nombre</Label>
                <Input id="profile-name" {...register("name", { required: true })} placeholder="Tu nombre" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-email">Email</Label>
                <Input id="profile-email" type="email" {...register("email", { required: true })} placeholder="tu@email.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-username">Username</Label>
                <Input id="profile-username" {...register("username", { required: true })} placeholder="tu_usuario" />
              </div>

              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    reset({
                      name: user?.name || "",
                      email: user?.email || "",
                      username: user?.username || "",
                    });
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar cambios"
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}