import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { AuthApi } from "@/lib/auth";
import type { AuthProfileResponse } from "@/lib/types";
import { errorDescription } from "./types";

type ProfileUser = AuthProfileResponse["user"];

export function useProfileData() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await AuthApi.me();
      setUser(response.user);
    } catch (error) {
      toast({
        title: "No se pudo cargar el perfil",
        description: errorDescription(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    let alive = true;

    (async () => {
      if (alive) {
        await loadProfile();
      }
    })();

    return () => {
      alive = false;
    };
  }, [loadProfile]);

  return { user, setUser, loading, loadProfile };
}
