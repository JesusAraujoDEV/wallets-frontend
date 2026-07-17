import type { UseFormRegister } from "react-hook-form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, PencilLine } from "lucide-react";
import type { AuthProfileResponse } from "@/lib/types";
import { ProfileEditForm } from "./ProfileEditForm";
import { ProfileField } from "./ProfileField";
import type { ProfileEditFormValues } from "./types";

export function ProfileInfoCard({
  user, loading, isEditing, setIsEditing, userInitials, register, onSubmit, isSubmitting, isGoogleUser,
  onCancelEdit, onOpenEmailDialog, onOpenUnlinkDialog,
}: {
  user: AuthProfileResponse["user"] | null;
  loading: boolean;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  userInitials: string;
  register: UseFormRegister<ProfileEditFormValues>;
  onSubmit: (event: React.FormEvent) => void;
  isSubmitting: boolean;
  isGoogleUser: boolean;
  onCancelEdit: () => void;
  onOpenEmailDialog: () => void;
  onOpenUnlinkDialog: () => void;
}) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14 border border-emerald-100 bg-emerald-50 text-emerald-700">
              <AvatarFallback className="bg-emerald-50 text-base font-semibold text-emerald-700">{userInitials || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl text-card-foreground">Perfil</CardTitle>
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
          <div className="flex min-h-40 items-center justify-center text-muted-foreground">
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
          <ProfileEditForm
            register={register}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            isGoogleUser={isGoogleUser}
            onCancel={onCancelEdit}
            onOpenEmailDialog={onOpenEmailDialog}
            onOpenUnlinkDialog={onOpenUnlinkDialog}
          />
        )}
      </CardContent>
    </Card>
  );
}
