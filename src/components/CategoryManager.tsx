import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Plus, Trash2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { CategoriesStore, fetchCategoryGroups, newId, onDataChange } from "@/lib/storage";
import type { Category, CategoryGroup } from "@/lib/types";
import { CategoryEditorDialog, type CategoryEditorValue } from "@/components/CategoryEditorDialog";
import { CategoryIcon } from "@/components/CategoryIcon";

export const CategoryManager = () => {
  const [categories, setCategories] = useState<Category[]>(CategoriesStore.all());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [formData, setFormData] = useState<CategoryEditorValue>({
    name: "",
    type: "expense",
    groupId: "",
    color: "hsl(var(--chart-6))",
    colorName: "Sky Blue",
    icon: null,
  });

  const handleCreateOrUpdate = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.color) return;
    if (!formData.groupId) {
      toast({
        title: "Error",
        description: "Category group is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingCategory) {
        await CategoriesStore.upsert({
          ...editingCategory,
          name: formData.name,
          type: formData.type,
          color: formData.color,
          colorName: formData.colorName,
          icon: formData.icon ?? null,
          groupId: Number(formData.groupId),
        });
        toast({ title: "Category Updated", description: `${formData.name} has been updated successfully.` });
      } else {
        const newCategory: Category = {
          id: newId(),
          name: formData.name,
          type: formData.type,
          color: formData.color,
          colorName: formData.colorName,
          icon: formData.icon ?? null,
          groupId: Number(formData.groupId),
        };
        await CategoriesStore.upsert(newCategory);
        toast({ title: "Category Created", description: `${formData.name} has been added successfully.` });
      }
      handleCloseDialog();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      groupId: String(category.groupId),
      color: category.color,
      colorName: category.colorName,
      icon: category.icon ?? null,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    try {
      setDeletingId(categoryId);
      await CategoriesStore.remove(categoryId);
      toast({ title: "Category Deleted", description: `${category?.name} has been removed.` });
    } finally {
      setDeletingId(null);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", type: "expense", groupId: "", color: "hsl(var(--chart-6))", colorName: "Sky Blue", icon: null });
  };

  const loadGroups = async () => {
    try {
      setGroupsLoading(true);
      const nextGroups = await fetchCategoryGroups();
      setGroups(nextGroups);
      if (nextGroups.length > 0 && !editingCategory) {
        setFormData((prev) => ({ ...prev, groupId: prev.groupId || String(nextGroups[0].id) }));
      }
    } catch (error) {
      toast({ title: "Error", description: `Unable to load category groups: ${String(error)}`, variant: "destructive" });
    } finally {
      setGroupsLoading(false);
    }
  };

  useEffect(() => {
    setCategories(CategoriesStore.all());
    const off = onDataChange(() => setCategories(CategoriesStore.all()));
    return off;
  }, []);

  useEffect(() => {
    loadGroups();
  }, []);

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
        {/* No import/export UI; persistence handled via functions (localStorage) */}
        {/* Expense Categories */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">EXPENSE CATEGORIES</h3>
          <div className="space-y-2">
            {expenseCategories.map((category) => {
              return (
                <div
                  key={category.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
                >
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
                      onClick={() => handleEdit(category)}
                      className="h-8 w-8 p-0"
                      disabled={deletingId === category.id}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmDeleteId(category.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      disabled={deletingId === category.id}
                    >
                      {deletingId === category.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Income Categories */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">INCOME CATEGORIES</h3>
          <div className="space-y-2">
            {incomeCategories.map((category) => {
              return (
                <div
                  key={category.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
                >
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
                      onClick={() => handleEdit(category)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmDeleteId(category.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      disabled={deletingId === category.id}
                    >
                      {deletingId === category.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
      {/* Confirm delete dialog */}
      <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => setConfirmDeleteId(open ? confirmDeleteId : null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category and remove it from your transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={!!deletingId}
              onClick={async () => {
                if (!confirmDeleteId) return;
                await handleDelete(confirmDeleteId);
                setConfirmDeleteId(null);
              }}
            >
              {deletingId ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
