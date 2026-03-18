import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { AuthApi } from "@/lib/auth";
import type { AuthProfileResponse } from "@/lib/types";
import { Loader2, PencilLine } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 break-words text-base font-medium text-slate-950">{value}</p>
    </div>
  );
}

type OtpBoxesInputProps = {
  idPrefix: string;
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
};

function OtpBoxesInput({ idPrefix, value, onChange, disabled = false }: OtpBoxesInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const setDigitAt = (index: number, rawValue: string) => {
    const lastChar = rawValue.slice(-1);
    const normalized = /\d/.test(lastChar) ? lastChar : "";
    const next = [...value];
    next[index] = normalized;
    onChange(next);

    if (normalized && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !value[index] && index > 0) {
      const next = [...value];
      next[index - 1] = "";
      onChange(next);
      inputRefs.current[index - 1]?.focus();
      event.preventDefault();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
      event.preventDefault();
    }

    if (event.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
      event.preventDefault();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i += 1) {
      next[i] = pasted[i];
    }
    onChange(next);
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
    event.preventDefault();
  };

  return (
    <div className="flex justify-center gap-2 my-4">
      {value.map((digit, index) => (
        <Input
          key={`${idPrefix}-${index}`}
          id={`${idPrefix}-${index}`}
          ref={(node) => {
            inputRefs.current[index] = node;
          }}
          value={digit}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          disabled={disabled}
          className="w-12 h-12 text-center text-xl font-bold rounded-md border"
          onChange={(event) => setDigitAt(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
}
export default function Profile() {
  const [user, setUser] = useState<AuthProfileResponse["user"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailStep, setEmailStep] = useState<1 | 2 | 3>(1);
  const [currentPassword, setCurrentPassword] = useState("");
  const [oldEmailCodeDigits, setOldEmailCodeDigits] = useState(["", "", "", "", "", ""]);
  const [newEmail, setNewEmail] = useState("");
  const [newEmailCodeDigits, setNewEmailCodeDigits] = useState(["", "", "", "", "", ""]);
  const [emailFlowLoading, setEmailFlowLoading] = useState(false);
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false);
  const [unlinkPassword, setUnlinkPassword] = useState("");
  const [unlinkConfirmPassword, setUnlinkConfirmPassword] = useState("");
  const [unlinkLoading, setUnlinkLoading] = useState(false);
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

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await AuthApi.me();
      setUser(response.user);
      reset({
        name: response.user.name || "",
        email: response.user.email || "",
        username: response.user.username || "",
      });
    } catch (error) {
      toast({
        title: "No se pudo cargar el perfil",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [reset, toast]);

  useEffect(() => {
    let alive = true;

    (async () => {
      if (alive) {
        await loadProfile();
      }
    })();

    return () => {
      alive = false;
    };
  }, [loadProfile]);

  const onSubmit = handleSubmit(async (values) => {
    if (!user) return;

    const nextName = values.name.trim();
    const nextUsername = values.username.trim();

    const payload = {
      ...(nextName !== user.name ? { name: nextName } : {}),
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

  const resetEmailFlow = () => {
    setEmailStep(1);
    setCurrentPassword("");
    setOldEmailCodeDigits(["", "", "", "", "", ""]);
    setNewEmail("");
    setNewEmailCodeDigits(["", "", "", "", "", ""]);
    setEmailFlowLoading(false);
  };

  const shouldShowDuplicatedEmailToast = (error: unknown) => {
    const fallback = "";
    const message = error instanceof Error ? error.message : fallback;
    const normalized = message.toLowerCase();
    return (
      normalized.includes("400")
      || normalized.includes("already")
      || normalized.includes("existe")
      || normalized.includes("invalid")
      || normalized.includes("inval")
      || normalized.includes("duplicate")
      || normalized.includes("used")
    );
  };

  const handleRequestEmailChange = async () => {
    const password = currentPassword.trim();
    if (!password) {
      toast({
        title: "Contraseña requerida",
        description: "Ingresa tu contraseña actual para continuar.",
        variant: "destructive",
      });
      return;
    }

    setEmailFlowLoading(true);
    try {
      await AuthApi.requestEmailChange({ currentPassword: password });
      setEmailStep(2);
      toast({
        title: "Codigo enviado",
        description: "Revisa tu correo actual e ingresa el codigo OTP.",
      });
    } catch (error) {
      toast({
        title: "No se pudo iniciar el cambio de correo",
        description: error instanceof Error ? error.message : "Contraseña incorrecta.",
        variant: "destructive",
      });
    } finally {
      setEmailFlowLoading(false);
    }
  };

  const handleVerifyOldEmailOtp = async () => {
    const code = oldEmailCodeDigits.join("").trim();
    const candidateNewEmail = newEmail.trim();

    if (!code || !candidateNewEmail) {
      toast({
        title: "Datos incompletos",
        description: "Debes ingresar el codigo OTP y el nuevo correo.",
        variant: "destructive",
      });
      return;
    }

    if (code.length !== 6) {
      toast({
        title: "Codigo incompleto",
        description: "Ingresa un codigo valido de 6 digitos.",
        variant: "destructive",
      });
      return;
    }

    setEmailFlowLoading(true);
    try {
      await AuthApi.verifyOldEmailOtp({ code, newEmail: candidateNewEmail });
      setNewEmail(candidateNewEmail);
      setEmailStep(3);
      toast({
        title: "Correo validado",
        description: "Ahora ingresa el codigo enviado al nuevo correo.",
      });
    } catch (error) {
      if (shouldShowDuplicatedEmailToast(error)) {
        toast({
          title: "No se pudo validar el codigo",
          description: "El correo ya existe o es inválido. Por favor, intenta con otro.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "No se pudo validar el codigo",
        description: error instanceof Error ? error.message : "Codigo invalido.",
        variant: "destructive",
      });
    } finally {
      setEmailFlowLoading(false);
    }
  };

  const handleConfirmNewEmail = async () => {
    const code = newEmailCodeDigits.join("").trim();
    if (!code || !newEmail.trim()) {
      toast({
        title: "Datos incompletos",
        description: "Ingresa el codigo OTP del nuevo correo.",
        variant: "destructive",
      });
      return;
    }

    if (code.length !== 6) {
      toast({
        title: "Codigo incompleto",
        description: "Ingresa un codigo valido de 6 digitos.",
        variant: "destructive",
      });
      return;
    }

    setEmailFlowLoading(true);
    try {
      await AuthApi.confirmNewEmail({ code, newEmail: newEmail.trim() });
      toast({
        title: "Correo actualizado",
        description: "Tu correo fue cambiado correctamente.",
      });
      setEmailDialogOpen(false);
      resetEmailFlow();
      await loadProfile();
    } catch (error) {
      toast({
        title: "No se pudo confirmar el nuevo correo",
        description: error instanceof Error ? error.message : "Codigo invalido.",
        variant: "destructive",
      });
    } finally {
      setEmailFlowLoading(false);
    }
  };

  const handleUnlinkGoogle = async () => {
    const newPasswordValue = unlinkPassword.trim();
    const confirmPasswordValue = unlinkConfirmPassword.trim();

    if (!newPasswordValue || !confirmPasswordValue) {
      toast({
        title: "Completa ambos campos",
        description: "Debes definir y confirmar la nueva contraseña.",
        variant: "destructive",
      });
      return;
    }

    if (newPasswordValue !== confirmPasswordValue) {
      toast({
        title: "Las contraseñas no coinciden",
        description: "Verifica la confirmacion e intenta nuevamente.",
        variant: "destructive",
      });
      return;
    }

    setUnlinkLoading(true);
    try {
      await AuthApi.unlinkGoogle({ newPassword: newPasswordValue });
      toast({
        title: "Google desvinculado",
        description: "Ahora puedes iniciar sesion con correo y contraseña local.",
      });
      setUnlinkDialogOpen(false);
      setUnlinkPassword("");
      setUnlinkConfirmPassword("");
      await loadProfile();
    } catch (error) {
      toast({
        title: "No se pudo desvincular Google",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setUnlinkLoading(false);
    }
  };

  const isGoogleUser = user?.authProvider === "google";

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
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Input
                    id="profile-email"
                    type="email"
                    {...register("email", { required: true })}
                    placeholder="tu@email.com"
                    disabled
                    className="w-full"
                  />
                  {!isGoogleUser ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => {
                        resetEmailFlow();
                        setEmailDialogOpen(true);
                      }}
                    >
                      Cambiar Correo
                    </Button>
                  ) : null}
                </div>
              </div>

              {isGoogleUser ? (
                <Alert>
                  <AlertTitle>Cuenta vinculada con Google</AlertTitle>
                  <AlertDescription>
                    Has iniciado sesion con Google. Para cambiar tu correo, primero debes crear una contraseña.
                  </AlertDescription>
                </Alert>
              ) : null}

              {isGoogleUser ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setUnlinkDialogOpen(true)}
                >
                  Desvincular Google
                </Button>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="profile-username">Username</Label>
                <Input id="profile-username" {...register("username", { required: true })} placeholder="tu_usuario" />
              </div>

              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
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
                <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting} aria-busy={isSubmitting}>
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

      <Dialog
        open={emailDialogOpen}
        onOpenChange={(open) => {
          setEmailDialogOpen(open);
          if (!open) {
            resetEmailFlow();
          }
        }}
      >
        <DialogContent className="w-[95vw] max-w-md overflow-x-hidden max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cambiar correo</DialogTitle>
            <DialogDescription>Completa el flujo de seguridad con OTP para actualizar tu correo.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {emailStep === 1 ? (
              <div className="space-y-2">
                <Label htmlFor="otp-current-password">Contraseña actual</Label>
                <Input
                  id="otp-current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  placeholder="Ingresa tu contraseña"
                />
              </div>
            ) : null}

            {emailStep === 2 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="otp-old-email-code">Codigo OTP (correo actual)</Label>
                  <OtpBoxesInput
                    idPrefix="otp-old-email-code"
                    value={oldEmailCodeDigits}
                    onChange={setOldEmailCodeDigits}
                    disabled={emailFlowLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otp-new-email">Nuevo correo</Label>
                  <Input
                    id="otp-new-email"
                    type="email"
                    value={newEmail}
                    onChange={(event) => setNewEmail(event.target.value)}
                    placeholder="nuevo@email.com"
                  />
                </div>
              </>
            ) : null}

            {emailStep === 3 ? (
              <>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  Confirmando nuevo correo: <span className="font-medium">{newEmail}</span>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otp-new-email-code">Codigo OTP (nuevo correo)</Label>
                  <OtpBoxesInput
                    idPrefix="otp-new-email-code"
                    value={newEmailCodeDigits}
                    onChange={setNewEmailCodeDigits}
                    disabled={emailFlowLoading}
                  />
                </div>
              </>
            ) : null}
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-4">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setEmailDialogOpen(false)}
              disabled={emailFlowLoading}
            >
              Cancelar
            </Button>

            {emailStep === 1 ? (
              <Button type="button" className="w-full sm:w-auto" onClick={handleRequestEmailChange} disabled={emailFlowLoading}>
                {emailFlowLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Continuar"
                )}
              </Button>
            ) : null}

            {emailStep === 2 ? (
              <Button type="button" className="w-full sm:w-auto" onClick={handleVerifyOldEmailOtp} disabled={emailFlowLoading}>
                {emailFlowLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validando...
                  </>
                ) : (
                  "Verificar codigo"
                )}
              </Button>
            ) : null}

            {emailStep === 3 ? (
              <Button type="button" className="w-full sm:w-auto" onClick={handleConfirmNewEmail} disabled={emailFlowLoading}>
                {emailFlowLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirmando...
                  </>
                ) : (
                  "Confirmar correo"
                )}
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={unlinkDialogOpen}
        onOpenChange={(open) => {
          setUnlinkDialogOpen(open);
          if (!open) {
            setUnlinkPassword("");
            setUnlinkConfirmPassword("");
          }
        }}
      >
        <DialogContent className="w-[95vw] max-w-md overflow-x-hidden max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Desvincular Google</DialogTitle>
            <DialogDescription>Define una contraseña para continuar con autenticación local.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="unlink-password">Nueva contraseña</Label>
              <Input
                id="unlink-password"
                type="password"
                value={unlinkPassword}
                onChange={(event) => setUnlinkPassword(event.target.value)}
                placeholder="Ingresa una contraseña"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unlink-password-confirm">Confirmar contraseña</Label>
              <Input
                id="unlink-password-confirm"
                type="password"
                value={unlinkConfirmPassword}
                onChange={(event) => setUnlinkConfirmPassword(event.target.value)}
                placeholder="Repite la contraseña"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-4">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setUnlinkDialogOpen(false)}
              disabled={unlinkLoading}
            >
              Cancelar
            </Button>
            <Button type="button" className="w-full sm:w-auto" onClick={handleUnlinkGoogle} disabled={unlinkLoading}>
              {unlinkLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Desvincular Google"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}