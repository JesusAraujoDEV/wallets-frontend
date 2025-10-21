import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthApi } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const USERNAMES = [
  'JesuAura',
  'PepoAura',
  'GaboAura',
  'CarluchoAura',
  'DavidAura',
  'CesarAura',
];

export default function Login() {
  const [username, setUsername] = useState<string>(USERNAMES[0]);
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      await AuthApi.login(username, password);
      toast({ title: 'Bienvenido', description: `Sesión iniciada como ${username}` });
      navigate('/', { replace: true });
    } catch (err: any) {
      toast({ title: 'Login fallido', description: 'Usuario o contraseña incorrectos', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 p-6 rounded-lg border bg-card">
        <h1 className="text-2xl font-semibold">Iniciar sesión</h1>

        <div className="space-y-2">
          <Label htmlFor="username">Usuario</Label>
          <select
            id="username"
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          >
            {USERNAMES.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </div>
  );
}
