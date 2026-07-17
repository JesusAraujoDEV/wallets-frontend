import { ChangePasswordDialog } from "./profile/ChangePasswordDialog";
import { EmailChangeDialog } from "./profile/EmailChangeDialog";
import { ProfileInfoCard } from "./profile/ProfileInfoCard";
import { SecurityCard } from "./profile/SecurityCard";
import { UnlinkGoogleDialog } from "./profile/UnlinkGoogleDialog";
import { useChangePasswordDialog } from "./profile/useChangePasswordDialog";
import { useEmailChangeDialog } from "./profile/useEmailChangeDialog";
import { useProfileData } from "./profile/useProfileData";
import { useProfileEditForm } from "./profile/useProfileEditForm";
import { useUnlinkGoogleDialog } from "./profile/useUnlinkGoogleDialog";

export default function Profile() {
  const { user, setUser, loading, loadProfile } = useProfileData();
  const form = useProfileEditForm(user, setUser);

  const emailDialog = useEmailChangeDialog(loadProfile);
  const unlinkDialog = useUnlinkGoogleDialog(loadProfile);
  const passwordDialog = useChangePasswordDialog();

  const isGoogleUser = user?.authProvider === "google";
  const userInitials = (user?.name || user?.username || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  return (
    <div className="space-y-6">
      <ProfileInfoCard
        user={user}
        loading={loading}
        isEditing={form.isEditing}
        setIsEditing={form.setIsEditing}
        userInitials={userInitials}
        register={form.form.register}
        onSubmit={form.onSubmit}
        isSubmitting={form.form.formState.isSubmitting}
        isGoogleUser={isGoogleUser}
        onCancelEdit={form.cancelEdit}
        onOpenEmailDialog={emailDialog.openDialog}
        onOpenUnlinkDialog={() => unlinkDialog.setOpen(true)}
      />

      {user?.authProvider === "local" ? (
        <SecurityCard onChangePassword={() => passwordDialog.setOpen(true)} />
      ) : null}

      <EmailChangeDialog state={emailDialog} />
      <UnlinkGoogleDialog state={unlinkDialog} />
      <ChangePasswordDialog state={passwordDialog} />
    </div>
  );
}
