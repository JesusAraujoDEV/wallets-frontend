import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { AuthApi } from "@/lib/auth";
import { errorDescription } from "./types";

function isDuplicatedEmailError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
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
}

export function useEmailChangeMutations() {
  const { toast } = useToast();

  const requestChangeMutation = useMutation({
    mutationFn: (currentPassword: string) => AuthApi.requestEmailChange({ currentPassword }),
    onError: (error) => {
      toast({ title: "No se pudo iniciar el cambio de correo", description: errorDescription(error), variant: "destructive" });
    },
  });

  const verifyOldOtpMutation = useMutation({
    mutationFn: (payload: { code: string; newEmail: string }) => AuthApi.verifyOldEmailOtp(payload),
    onError: (error) => {
      if (isDuplicatedEmailError(error)) {
        toast({ title: "No se pudo validar el codigo", description: "El correo ya existe o es inválido. Por favor, intenta con otro.", variant: "destructive" });
        return;
      }
      toast({ title: "No se pudo validar el codigo", description: errorDescription(error), variant: "destructive" });
    },
  });

  const confirmNewEmailMutation = useMutation({
    mutationFn: (payload: { code: string; newEmail: string }) => AuthApi.confirmNewEmail(payload),
    onError: (error) => {
      toast({ title: "No se pudo confirmar el nuevo correo", description: errorDescription(error), variant: "destructive" });
    },
  });

  return { requestChangeMutation, verifyOldOtpMutation, confirmNewEmailMutation };
}
