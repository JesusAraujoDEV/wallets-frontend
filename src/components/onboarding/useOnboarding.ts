import { useEffect, useState } from "react";
import { AuthApi } from "@/lib/auth";
import { hasSeenOnboarding, markOnboardingSeen } from "@/lib/onboarding";

export function useOnboarding() {
  const [userId, setUserId] = useState<string | number | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    AuthApi.me()
      .then((res) => {
        if (!mounted) return;
        const id = res.user.id;
        setUserId(id);
        if (!hasSeenOnboarding(id)) setOpen(true);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const finish = () => { if (userId != null) markOnboardingSeen(userId); };
  const replay = () => setOpen(true);

  return { open, setOpen, finish, replay };
}
