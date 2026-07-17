import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { AuthApi } from "@/lib/auth";
import type { AuthProfileResponse } from "@/lib/types";
import { errorDescription, type ProfileEditFormValues } from "./types";

type ProfileUser = AuthProfileResponse["user"];

function toFormValues(user: ProfileUser | null): ProfileEditFormValues {
  return { name: user?.name || "", email: user?.email || "", username: user?.username || "" };
}

export function useProfileEditForm(user: ProfileUser | null, setUser: (user: ProfileUser) => void) {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const form = useForm<ProfileEditFormValues>({ defaultValues: toFormValues(null) });
  const { handleSubmit, reset } = form;

  // Keep the form in sync whenever the loaded user changes (initial load, or a
  // reload triggered by the email/unlink dialogs), mirroring the original
  // single-component behavior where loadProfile always reset the form.
  useEffect(() => {
    if (user) reset(toFormValues(user));
  }, [user, reset]);

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
      reset(toFormValues(updatedUser));
      setIsEditing(false);
      toast({ title: "Perfil actualizado", description: "Tus datos se guardaron correctamente." });
    } catch (error) {
      toast({ title: "No se pudo actualizar el perfil", description: errorDescription(error), variant: "destructive" });
    }
  });

  const cancelEdit = () => {
    setIsEditing(false);
    reset(toFormValues(user));
  };

  return { form, isEditing, setIsEditing, onSubmit, cancelEdit };
}
