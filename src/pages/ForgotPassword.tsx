import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
        title: t("auth.forgotPassword.successTitle"),
        description: t("auth.forgotPassword.successDescription"),
      });
    } catch (err: any) {
      toast({
        title: t("auth.forgotPassword.errorTitle"),
        description: err?.message || t("auth.forgotPassword.errorDescription"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      <div className="w-full flex items-center justify-center p-8">
        <Card className="w-full max-w-md border-0 bg-card p-2 rounded-2xl shadow-xl lg:shadow-none">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-card-foreground">{t("auth.forgotPassword.title")}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {t("auth.forgotPassword.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.forgotPassword.emailLabel")}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t("auth.forgotPassword.emailPlaceholder")}
                  {...register("email", {
                    required: t("auth.forgotPassword.emailRequired"),
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: t("auth.forgotPassword.emailInvalid"),
                    },
                  })}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? t("auth.forgotPassword.submitLoading") : t("auth.forgotPassword.submit")}
              </Button>

              <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/login")}>
                {t("auth.forgotPassword.backToLogin")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
