import { AccountSelector } from "@/components/AccountSelector";
import { TransactionsCalendar } from "@/components/TransactionsCalendar";
import { TransactionsList } from "@/components/TransactionsList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function Transactions() {
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [view, setView] = useState<"list" | "calendar">("list");

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-card-foreground">Transacciones</CardTitle>
          <CardDescription>
            Administra movimientos, filtra tu historial y explora el calendario financiero desde una ruta dedicada.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={view} onValueChange={(value) => setView(value as "list" | "calendar")} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-grid">
              <TabsTrigger value="list">Listado</TabsTrigger>
              <TabsTrigger value="calendar">Calendario</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              <TransactionsList />
            </TabsContent>

            <TabsContent value="calendar" className="space-y-4">
              <AccountSelector selectedAccount={selectedAccount} onAccountChange={setSelectedAccount} />
              <TransactionsCalendar selectedAccount={selectedAccount} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}