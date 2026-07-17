import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { CategoryEditorDialog } from "@/components/CategoryEditorDialog";
import { CategoryListSection } from "./CategoryListSection";
import { DeleteCategoryDialog } from "./DeleteCategoryDialog";
import { useCategoryManagerData } from "./useCategoryManagerData";
import { useCategoryFormDialog } from "./useCategoryFormDialog";
import { useCategoryDelete } from "./useCategoryDelete";

export const CategoryManager = () => {
  const { categories, groups, groupsLoading } = useCategoryManagerData();
  const {
    isDialogOpen,
    setIsDialogOpen,
    editingCategory,
    isSubmitting,
    formData,
    setFormData,
    handleCreateOrUpdate,
    handleEdit,
  } = useCategoryFormDialog();
  const { deletingId, confirmDeleteId, setConfirmDeleteId, handleDelete } = useCategoryDelete(categories);

  const expenseCategories = categories.filter(c => c.type === "expense");
  const incomeCategories = categories.filter(c => c.type === "income");

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Category Management</CardTitle>
            <CardDescription>Create and manage your custom categories</CardDescription>
          </div>
          <div className="flex w-full flex-col flex-wrap gap-2 sm:w-auto sm:flex-row">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full gap-2 sm:w-auto">
                  <Plus className="h-4 w-4" />
                  New Category
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
          <CategoryEditorDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            value={formData}
            onChange={setFormData}
            onSubmit={handleCreateOrUpdate}
            submitting={isSubmitting}
            title={editingCategory ? "Edit Category" : "Create New Category"}
            description={editingCategory ? "Update the category details below." : "Add a new category to organize your transactions."}
            groups={groups}
            groupsLoading={groupsLoading}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <CategoryListSection
          title="EXPENSE CATEGORIES"
          categories={expenseCategories}
          deletingId={deletingId}
          onEdit={handleEdit}
          onRequestDelete={setConfirmDeleteId}
        />
        <CategoryListSection
          title="INCOME CATEGORIES"
          categories={incomeCategories}
          deletingId={deletingId}
          onEdit={handleEdit}
          onRequestDelete={setConfirmDeleteId}
        />
      </CardContent>
      <DeleteCategoryDialog
        confirmDeleteId={confirmDeleteId}
        deletingId={deletingId}
        onOpenChange={setConfirmDeleteId}
        onConfirm={async () => {
          if (!confirmDeleteId) return;
          await handleDelete(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
      />
    </Card>
  );
};
