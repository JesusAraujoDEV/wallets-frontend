import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { AuthApi } from "@/lib/auth";
import { errorDescription } from "./types";

export function useUnlinkGoogleDialog(loadProfile: () => Promise<void>) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();

  const unlinkMutation = useMutation({
    mutationFn: (newPassword: string) => AuthApi.unlinkGoogle({ newPassword }),
    onError: (error) => {
      toast({ title: "No se pudo desvincular Google", description: errorDescription(error), variant: "destructive" });
    },
  });

  const resetFields = () => {
    setPassword("");
    setConfirmPassword("");
  };

  const onOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) resetFields();
  };

  const unlink = async () => {
    const newPasswordValue = password.trim();
    const confirmPasswordValue = confirmPassword.trim();

    if (!newPasswordValue || !confirmPasswordValue) {
      toast({ title: "Completa ambos campos", description: "Debes definir y confirmar la nueva contraseña.", variant: "destructive" });
      return;
    }
    if (newPasswordValue !== confirmPasswordValue) {
      toast({ title: "Las contraseñas no coinciden", description: "Verifica la confirmacion e intenta nuevamente.", variant: "destructive" });
      return;
    }

    await unlinkMutation.mutateAsync(newPasswordValue, {
      onSuccess: async () => {
        toast({ title: "Google desvinculado", description: "Ahora puedes iniciar sesion con correo y contraseña local." });
        setOpen(false);
        resetFields();
        await loadProfile();
      },
    });
  };

  return {
    open, setOpen, onOpenChange,
    password, setPassword, confirmPassword, setConfirmPassword,
    loading: unlinkMutation.isPending, unlink,
  };
}
