import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { AuthApi } from "@/lib/auth";
import { errorDescription } from "./types";

export function useChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();

  const changePasswordMutation = useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) => AuthApi.changePassword(payload),
    onError: (error) => {
      toast({ title: "No se pudo cambiar la contraseña", description: errorDescription(error), variant: "destructive" });
    },
  });

  const resetFields = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const onOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) resetFields();
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const current = currentPassword.trim();
    const next = newPassword.trim();
    const confirm = confirmPassword.trim();

    if (!current || !next || !confirm) {
      toast({ title: "Completa todos los campos", description: "Debes ingresar y confirmar la nueva contraseña.", variant: "destructive" });
      return;
    }
    if (next !== confirm) {
      toast({ title: "Las contraseñas no coinciden", description: "Verifica la nueva contraseña y su confirmación.", variant: "destructive" });
      return;
    }

    await changePasswordMutation.mutateAsync({ currentPassword: current, newPassword: next }, {
      onSuccess: () => {
        toast({ title: "Contraseña actualizada correctamente", className: "border-emerald-200 bg-emerald-50 text-emerald-900" });
        setOpen(false);
        resetFields();
      },
    });
  };

  return {
    open, setOpen, onOpenChange,
    currentPassword, setCurrentPassword,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    loading: changePasswordMutation.isPending, submit,
  };
}
