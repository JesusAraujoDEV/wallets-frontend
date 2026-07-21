import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthApi, type AuthUser } from '@/lib/auth';

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let alive = true;
    const handleUnauthorized = () => {
      if (alive) {
        setUser(null);
        setLoading(false);
      }
    };
    window.addEventListener("platica:unauthorized", handleUnauthorized);

    (async () => {
      try {
        const response = await AuthApi.me();
        if (alive) setUser(response.user);
      } catch {
        if (alive) setUser(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
      window.removeEventListener("platica:unauthorized", handleUnauthorized);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        {t("auth.requireAuth.checkingSession")}
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
