import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SecurityCard({ onChangePassword }: { onChangePassword: () => void }) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle>Seguridad</CardTitle>
        <CardDescription>Gestiona tu contraseña de acceso local.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button type="button" variant="outline" onClick={onChangePassword}>
          Cambiar contraseña
        </Button>
      </CardContent>
    </Card>
  );
}
