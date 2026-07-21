import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
        title: t("auth.resetPassword.successTitle"),
        description: t("auth.resetPassword.successDescription"),
      });
      navigate("/login", { replace: true });
    } catch (err: any) {
      toast({
        title: t("auth.resetPassword.errorTitle"),
        description: err?.message || t("auth.resetPassword.errorDescription"),
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
              <CardTitle className="text-2xl font-bold text-card-foreground">{t("auth.resetPassword.title")}</CardTitle>
              <CardDescription className="text-muted-foreground">{t("auth.resetPassword.invalidLinkDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button type="button" className="w-full" onClick={() => navigate("/login")}>
                {t("auth.forgotPassword.backToLogin")}
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
            <CardTitle className="text-2xl font-bold text-card-foreground">{t("auth.resetPassword.title")}</CardTitle>
            <CardDescription className="text-muted-foreground">{t("auth.resetPassword.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">{t("auth.resetPassword.newPasswordLabel")}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder={t("auth.resetPassword.newPasswordPlaceholder")}
                  {...register("newPassword", {
                    required: t("auth.resetPassword.newPasswordRequired"),
                    minLength: {
                      value: 6,
                      message: t("auth.resetPassword.newPasswordMinLength"),
                    },
                  })}
                />
                {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("auth.resetPassword.confirmPasswordLabel")}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder={t("auth.resetPassword.confirmPasswordPlaceholder")}
                  {...register("confirmPassword", {
                    required: t("auth.resetPassword.confirmPasswordRequired"),
                    validate: (value, values) => value === values.newPassword || t("auth.resetPassword.passwordsMismatch"),
                  })}
                />
                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? t("auth.resetPassword.submitLoading") : t("auth.resetPassword.submit")}
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
