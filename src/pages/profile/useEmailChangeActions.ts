import { useToast } from "@/components/ui/use-toast";
import { useEmailChangeMutations } from "./useEmailChangeMutations";
import type { useEmailChangeDialogState } from "./useEmailChangeDialogState";

export function useEmailChangeActions(state: ReturnType<typeof useEmailChangeDialogState>, loadProfile: () => Promise<void>) {
  const { toast } = useToast();
  const { requestChangeMutation, verifyOldOtpMutation, confirmNewEmailMutation } = useEmailChangeMutations();
  const loading = requestChangeMutation.isPending || verifyOldOtpMutation.isPending || confirmNewEmailMutation.isPending;

  const requestChange = async () => {
    const password = state.currentPassword.trim();
    if (!password) {
      toast({ title: "Contraseña requerida", description: "Ingresa tu contraseña actual para continuar.", variant: "destructive" });
      return;
    }
    await requestChangeMutation.mutateAsync(password, {
      onSuccess: () => {
        state.setStep(2);
        toast({ title: "Codigo enviado", description: "Revisa tu correo actual e ingresa el codigo OTP." });
      },
    });
  };

  const verifyOldOtp = async () => {
    const code = state.oldEmailCodeDigits.join("").trim();
    const candidateNewEmail = state.newEmail.trim();
    if (!code || !candidateNewEmail) {
      toast({ title: "Datos incompletos", description: "Debes ingresar el codigo OTP y el nuevo correo.", variant: "destructive" });
      return;
    }
    if (code.length !== 6) {
      toast({ title: "Codigo incompleto", description: "Ingresa un codigo valido de 6 digitos.", variant: "destructive" });
      return;
    }
    await verifyOldOtpMutation.mutateAsync({ code, newEmail: candidateNewEmail }, {
      onSuccess: () => {
        state.setNewEmail(candidateNewEmail);
        state.setStep(3);
        toast({ title: "Correo validado", description: "Ahora ingresa el codigo enviado al nuevo correo." });
      },
    });
  };

  const confirmNewEmail = async () => {
    const code = state.newEmailCodeDigits.join("").trim();
    if (!code || !state.newEmail.trim()) {
      toast({ title: "Datos incompletos", description: "Ingresa el codigo OTP del nuevo correo.", variant: "destructive" });
      return;
    }
    if (code.length !== 6) {
      toast({ title: "Codigo incompleto", description: "Ingresa un codigo valido de 6 digitos.", variant: "destructive" });
      return;
    }
    await confirmNewEmailMutation.mutateAsync({ code, newEmail: state.newEmail.trim() }, {
      onSuccess: async () => {
        toast({ title: "Correo actualizado", description: "Tu correo fue cambiado correctamente." });
        state.onOpenChange(false);
        await loadProfile();
      },
    });
  };

  return { loading, requestChange, verifyOldOtp, confirmNewEmail };
}
