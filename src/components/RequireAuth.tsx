import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthApi, type AuthUser } from '@/lib/auth';

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const u = await AuthApi.me();
        if (alive) setUser(u);
      } catch {
        if (alive) setUser(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Verificando sesión...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
