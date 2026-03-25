import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthApi } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

type ResetPasswordForm = {
  newPassword: string;
  confirmPassword: string;
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const token = (searchParams.get("token") || "").trim();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async ({ newPassword }: ResetPasswordForm) => {
    try {
      await AuthApi.resetPassword(token, newPassword);
      toast({
        title: "Contraseña actualizada",
        description: "Contraseña actualizada correctamente",
      });
      navigate("/login", { replace: true });
    } catch (err: any) {
      toast({
        title: "No se pudo restablecer",
        description: err?.message || "Ocurrió un error al restablecer la contraseña",
        variant: "destructive",
      });
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen w-full flex bg-background">
        <div className="w-full flex items-center justify-center p-8">
          <Card className="w-full max-w-md border-0 bg-card p-2 rounded-2xl shadow-xl lg:shadow-none">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-card-foreground">Crear nueva contraseña</CardTitle>
              <CardDescription className="text-muted-foreground">Enlace inválido o expirado</CardDescription>
            </CardHeader>
            <CardContent>
              <Button type="button" className="w-full" onClick={() => navigate("/login")}>
                Volver al Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-background">
      <div className="w-full flex items-center justify-center p-8">
        <Card className="w-full max-w-md border-0 bg-card p-2 rounded-2xl shadow-xl lg:shadow-none">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-card-foreground">Crear nueva contraseña</CardTitle>
            <CardDescription className="text-muted-foreground">Ingresa y confirma tu nueva contraseña.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva contraseña</Label>
                <Input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Mínimo 6 caracteres"
                  {...register("newPassword", {
                    required: "La nueva contraseña es obligatoria",
                    minLength: {
                      value: 6,
                      message: "La contraseña debe tener al menos 6 caracteres",
                    },
                  })}
                />
                {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repite tu nueva contraseña"
                  {...register("confirmPassword", {
                    required: "Confirma tu nueva contraseña",
                    validate: (value, values) => value === values.newPassword || "Las contraseñas no coinciden",
                  })}
                />
                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Actualizando..." : "Actualizar contraseña"}
              </Button>

              <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/login")}>
                Volver al Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
