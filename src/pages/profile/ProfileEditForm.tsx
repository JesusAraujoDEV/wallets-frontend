import type { UseFormRegister } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { ProfileEditFormValues } from "./types";

export function ProfileEditForm({
  register, onSubmit, isSubmitting, isGoogleUser, onCancel, onOpenEmailDialog, onOpenUnlinkDialog,
}: {
  register: UseFormRegister<ProfileEditFormValues>;
  onSubmit: (event: React.FormEvent) => void;
  isSubmitting: boolean;
  isGoogleUser: boolean;
  onCancel: () => void;
  onOpenEmailDialog: () => void;
  onOpenUnlinkDialog: () => void;
}) {
  return (
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
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onOpenEmailDialog}>
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
        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onOpenUnlinkDialog}>
          Desvincular Google
        </Button>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="profile-username">Username</Label>
        <Input id="profile-username" {...register("username", { required: true })} placeholder="tu_usuario" />
      </div>

      <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-4">
        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onCancel} disabled={isSubmitting}>
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
  );
}
