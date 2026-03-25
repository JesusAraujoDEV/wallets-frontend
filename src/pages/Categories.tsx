import { CategoryManager } from "@/components/CategoryManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Categories() {
  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-slate-950">Categorías</CardTitle>
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