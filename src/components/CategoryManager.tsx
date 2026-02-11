import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { CategoriesStore, newId, onDataChange } from "@/lib/storage";
import type { Category } from "@/lib/types";
import { CategoryEditorDialog, type CategoryEditorValue } from "@/components/CategoryEditorDialog";

export const CategoryManager = () => {
  const [categories, setCategories] = useState<Category[]>(CategoriesStore.all());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryEditorValue>({
    name: "",
    type: "expense",
    color: "hsl(var(--chart-6))",
    colorName: "Pastel Blue",
    icon: null,
  });
  // Bulk include/exclude modal state
  const [bulkOpen, setBulkOpen] = useState<null | 'enable' | 'disable'>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkOptions, setBulkOptions] = useState<Category[]>([]);
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);

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
    setFormData({ name: "", type: "expense", color: "hsl(var(--chart-6))", colorName: "Pastel Blue", icon: null });
  };

  useEffect(() => {
    setCategories(CategoriesStore.all());
    const off = onDataChange(() => setCategories(CategoriesStore.all()));
    return off;
  }, []);

  const expenseCategories = categories.filter(c => c.type === "expense");
  const incomeCategories = categories.filter(c => c.type === "income");

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Category Management</CardTitle>
            <CardDescription>Create and manage your custom categories</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                setBulkOpen('enable');
                setBulkLoading(true);
                setBulkSelected([]);
                try {
                  const opts = await CategoriesStore.fetchByIncludeInStats(false);
                  setBulkOptions(opts);
                } catch (e) {
                  toast({ title: 'Error loading categories', description: String(e), variant: 'destructive' });
                  setBulkOpen(null);
                } finally {
                  setBulkLoading(false);
                }
              }}
              disabled={isSubmitting}
            >
              Include in stats
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                setBulkOpen('disable');
                setBulkLoading(true);
                setBulkSelected([]);
                try {
                  const opts = await CategoriesStore.fetchByIncludeInStats(true);
                  setBulkOptions(opts);
                } catch (e) {
                  toast({ title: 'Error loading categories', description: String(e), variant: 'destructive' });
                  setBulkOpen(null);
                } finally {
                  setBulkLoading(false);
                }
              }}
              disabled={isSubmitting}
            >
              Exclude from stats
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
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
              const selected = selectedIds.includes(category.id);
              return (
                <div
                  key={category.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds(prev => [...prev, category.id]);
                      else setSelectedIds(prev => prev.filter(id => id !== category.id));
                    }}
                    className="h-4 w-4"
                  />
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{category.name}</p>
                    <p className="text-xs text-muted-foreground">{category.colorName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {category.includeInStats ? <Badge variant="outline" className="text-xs">In stats</Badge> : null}
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
              const selected = selectedIds.includes(category.id);
              return (
                <div
                  key={category.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds(prev => [...prev, category.id]);
                      else setSelectedIds(prev => prev.filter(id => id !== category.id));
                    }}
                    className="h-4 w-4"
                  />
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{category.name}</p>
                    <p className="text-xs text-muted-foreground">{category.colorName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {category.includeInStats ? <Badge variant="outline" className="text-xs">In stats</Badge> : null}
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
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
      {/* Bulk include/exclude dialog */}
      <Dialog open={!!bulkOpen} onOpenChange={(open) => { if (!open) { setBulkOpen(null); setBulkOptions([]); setBulkSelected([]); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{bulkOpen === 'enable' ? 'Include categories in stats' : 'Exclude categories from stats'}</DialogTitle>
            <DialogDescription>
              {bulkOpen === 'enable'
                ? 'Select one or more categories to include in stats.'
                : 'Select one or more categories to exclude from stats.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {bulkLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
            ) : bulkOptions.length === 0 ? (
              <div className="text-sm text-muted-foreground">No categories available.</div>
            ) : (
              bulkOptions.map(cat => {
                const checked = bulkSelected.includes(cat.id);
                return (
                  <label key={cat.id} className="flex items-center gap-3 p-2 rounded-md border hover:bg-muted/50">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) setBulkSelected(prev => [...prev, cat.id]);
                        else setBulkSelected(prev => prev.filter(id => id !== cat.id));
                      }}
                    />
                    <span className="w-4 h-4 rounded-full inline-block" style={{ backgroundColor: cat.color }} />
                    <span className="flex-1 min-w-0 truncate">{cat.name} <span className="ml-1 text-xs text-muted-foreground">({cat.type})</span></span>
                    {cat.includeInStats ? <Badge variant="outline" className="text-xs">In stats</Badge> : null}
                  </label>
                );
              })
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setBulkOpen(null); setBulkOptions([]); setBulkSelected([]); }} disabled={isSubmitting}>Cancel</Button>
            <Button
              onClick={async () => {
                if (!bulkOpen || bulkSelected.length === 0) return;
                try {
                  setIsSubmitting(true);
                  await CategoriesStore.bulkSetIncludeInStats(bulkSelected, bulkOpen === 'enable');
                  toast({ title: 'Updated', description: `${bulkOpen === 'enable' ? 'Included' : 'Excluded'} ${bulkSelected.length} categories.` });
                  setBulkOpen(null);
                  setBulkOptions([]);
                  setBulkSelected([]);
                } catch (e) {
                  toast({ title: 'Error', description: String(e), variant: 'destructive' });
                } finally {
                  setIsSubmitting(false);
                }
              }}
              disabled={bulkSelected.length === 0 || isSubmitting}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
