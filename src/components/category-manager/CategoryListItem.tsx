import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { CategoryIcon } from "@/components/CategoryIcon";
import type { Category } from "@/lib/types";

interface CategoryListItemProps {
  category: Category;
  isDeleting: boolean;
  onEdit: (category: Category) => void;
  onRequestDelete: (categoryId: string) => void;
}

export const CategoryListItem = ({ category, isDeleting, onEdit, onRequestDelete }: CategoryListItemProps) => {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors">
      <div
        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
        style={{ backgroundColor: category.color }}
        title={category.icon || undefined}
      >
        <CategoryIcon name={category.icon} className="h-4 w-4" color="#ffffff" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{category.name}</p>
        <p className="text-xs text-muted-foreground">{category.colorName}</p>
      </div>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(category)}
          className="h-8 w-8 p-0"
          disabled={isDeleting}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRequestDelete(category.id)}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          disabled={isDeleting}
        >
          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};
