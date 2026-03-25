import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { AuthApi } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

type ForgotPasswordForm = {
  email: string;
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async ({ email }: ForgotPasswordForm) => {
    try {
      await AuthApi.forgotPassword(email.trim());
      toast({
        title: "Correo enviado",
        description: "Correo enviado, revisa tu bandeja de entrada",
      });
    } catch (err: any) {
      toast({
        title: "No se pudo enviar",
        description: err?.message || "Ocurrió un error al enviar el correo de recuperación",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      <div className="w-full flex items-center justify-center p-8">
        <Card className="w-full max-w-md border-0 bg-card p-2 rounded-2xl shadow-xl lg:shadow-none">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-card-foreground">Recuperar contraseña</CardTitle>
            <CardDescription className="text-muted-foreground">
              Ingresa tu correo y te enviaremos instrucciones para restablecer el acceso.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="correo@ejemplo.com"
                  {...register("email", {
                    required: "El correo es obligatorio",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Ingresa un correo válido",
                    },
                  })}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Enviar correo de recuperación"}
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
