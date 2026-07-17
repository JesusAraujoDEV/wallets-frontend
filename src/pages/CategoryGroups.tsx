import { AssignCategoriesDialog } from "./category-groups/AssignCategoriesDialog";
import { DeleteGroupDialog } from "./category-groups/DeleteGroupDialog";
import { GroupFormDialog } from "./category-groups/GroupFormDialog";
import { GroupsListSection } from "./category-groups/GroupsListSection";
import { useAssignCategoriesDialog } from "./category-groups/useAssignCategoriesDialog";
import { useGroupFormDialog } from "./category-groups/useGroupFormDialog";
import { useGroupsList } from "./category-groups/useGroupsList";
import { useSaveCategoryAssignment } from "./category-groups/useSaveCategoryAssignment";

export default function CategoryGroups() {
  const { groups, loading, loadGroups, deletingId, confirmDeleteId, setConfirmDeleteId, handleDelete } = useGroupsList();
  const formDialog = useGroupFormDialog(loadGroups);
  const assignDialog = useAssignCategoriesDialog();
  const { savingAssignment, saveCategoryAssignment } = useSaveCategoryAssignment(loadGroups);

  return (
    <div className="space-y-6">
      <GroupsListSection
        groups={groups}
        loading={loading}
        deletingId={deletingId}
        onCreate={formDialog.openCreateDialog}
        onAssign={(group) => void assignDialog.openAssignDialog(group)}
        onEdit={formDialog.openEditDialog}
        onDelete={setConfirmDeleteId}
      />

      <DeleteGroupDialog
        confirmDeleteId={confirmDeleteId}
        deletingId={deletingId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId === null) return;
          handleDelete(confirmDeleteId);
        }}
      />

      <AssignCategoriesDialog
        open={assignDialog.assignDialogOpen}
        onOpenChange={(open) => !open && assignDialog.closeAssignDialog()}
        assigningGroup={assignDialog.assigningGroup}
        categories={assignDialog.filteredCategories}
        selectedCategoryIds={assignDialog.selectedCategoryIds}
        loadingCategories={assignDialog.loadingCategories}
        savingAssignment={savingAssignment}
        onToggleCategory={assignDialog.toggleCategorySelection}
        onCancel={assignDialog.closeAssignDialog}
        onSave={() =>
          void saveCategoryAssignment(assignDialog.assigningGroup, assignDialog.selectedCategoryIds, assignDialog.closeAssignDialog)
        }
      />

      <GroupFormDialog
        open={formDialog.dialogOpen}
        onOpenChange={(open) => !open && formDialog.closeDialog()}
        editingGroup={formDialog.editingGroup}
        form={formDialog.form}
        setForm={formDialog.setForm}
        saving={formDialog.saving}
        onSubmit={() => void formDialog.submitGroup()}
        onCancel={formDialog.closeDialog}
      />
    </div>
  );
}
