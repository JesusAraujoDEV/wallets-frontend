import { CategoryManager } from "@/components/CategoryManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Categories() {
  return (
    <div className="space-y-6">
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-card-foreground">Categorías</CardTitle>
          <CardDescription>
            Organiza ingresos y gastos desde un catálogo centralizado con edición y asignación por grupos de categoría.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryManager />
        </CardContent>
      </Card>
    </div>
  );
}