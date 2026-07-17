import type { Category } from "@/lib/types";
import { CategoryListItem } from "./CategoryListItem";

interface CategoryListSectionProps {
  title: string;
  categories: Category[];
  deletingId: string | null;
  onEdit: (category: Category) => void;
  onRequestDelete: (categoryId: string) => void;
}

export const CategoryListSection = ({ title, categories, deletingId, onEdit, onRequestDelete }: CategoryListSectionProps) => {
  return (
    <div>
      <h3 className="text-sm font-semibold text-muted-foreground mb-3">{title}</h3>
      <div className="space-y-2">
        {categories.map((category) => (
          <CategoryListItem
            key={category.id}
            category={category}
            isDeleting={deletingId === category.id}
            onEdit={onEdit}
            onRequestDelete={onRequestDelete}
          />
        ))}
      </div>
    </div>
  );
};
