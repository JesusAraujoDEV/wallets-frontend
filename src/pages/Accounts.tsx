import { AccountManager } from "@/components/AccountManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Accounts() {
  return (
    <div className="space-y-6">
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-card-foreground">Cuentas</CardTitle>
          <CardDescription>
            Crea, ajusta y monitorea tus cuentas desde una vista dedicada, sin mezclar navegación con el dashboard analítico.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AccountManager />
        </CardContent>
      </Card>
    </div>
  );
}