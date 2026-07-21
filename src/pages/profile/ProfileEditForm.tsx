import type { UseFormRegister } from "react-hook-form";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="profile-name">{t("auth.profileEdit.nameLabel")}</Label>
        <Input id="profile-name" {...register("name", { required: true })} placeholder={t("auth.profileEdit.namePlaceholder")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-email">{t("auth.profileEdit.emailLabel")}</Label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            id="profile-email"
            type="email"
            {...register("email", { required: true })}
            placeholder={t("auth.profileEdit.emailPlaceholder")}
            disabled
            className="w-full"
          />
          {!isGoogleUser ? (
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onOpenEmailDialog}>
              {t("auth.profileEdit.changeEmail")}
            </Button>
          ) : null}
        </div>
      </div>

      {isGoogleUser ? (
        <Alert>
          <AlertTitle>{t("auth.profileEdit.googleLinkedTitle")}</AlertTitle>
          <AlertDescription>
            {t("auth.profileEdit.googleLinkedDescription")}
          </AlertDescription>
        </Alert>
      ) : null}

      {isGoogleUser ? (
        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onOpenUnlinkDialog}>
          {t("auth.unlinkGoogle.title")}
        </Button>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="profile-username">{t("auth.profileEdit.usernameLabel")}</Label>
        <Input id="profile-username" {...register("username", { required: true })} placeholder={t("auth.profileEdit.usernamePlaceholder")} />
      </div>

      <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-4">
        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onCancel} disabled={isSubmitting}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("auth.common.saving")}
            </>
          ) : (
            t("auth.profileEdit.submit")
          )}
        </Button>
      </div>
    </form>
  );
}
