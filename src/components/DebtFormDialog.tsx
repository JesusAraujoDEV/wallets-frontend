import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DebtContactFields } from "./debt-form-dialog/DebtContactFields";
import { DebtAmountCurrencyFields } from "./debt-form-dialog/DebtAmountCurrencyFields";
import { DebtTypeCategoryDateFields } from "./debt-form-dialog/DebtTypeCategoryDateFields";
import { DebtFormDialogFooter } from "./debt-form-dialog/DebtFormDialogFooter";
import { useDebtFormFields } from "./debt-form-dialog/useDebtFormFields";
import type { DebtFormDialogProps } from "./debt-form-dialog/types";

export type { DebtFormValues } from "./debt-form-dialog/types";

export function DebtFormDialog({
  open,
  onOpenChange,
  debt,
  initialDate,
  initialType,
  lockType = false,
  categories,
  submitting,
  onSubmit,
}: DebtFormDialogProps) {
  const isEdit = !!debt;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useDebtFormFields(open, debt, initialDate, initialType);

  const onFormSubmit = handleSubmit((values) => {
    onSubmit(values);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full max-w-md sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar deuda" : "Nueva deuda"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifica los datos de la deuda."
              : "Registra una nueva deuda por pagar o por cobrar."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onFormSubmit}>
          <DebtContactFields register={register} errors={errors} />

          <DebtAmountCurrencyFields
            register={register}
            errors={errors}
            currency={watch("currency")}
            setCurrency={(v) => setValue("currency", v)}
          />

          <DebtTypeCategoryDateFields
            type={watch("type")}
            setType={(v) => setValue("type", v)}
            lockType={lockType}
            categories={categories}
            categoryId={watch("categoryId")}
            setCategoryId={(id) => setValue("categoryId", id, { shouldValidate: true })}
            dueDate={watch("dueDate")}
            setDueDate={(date) => setValue("dueDate", date, { shouldValidate: true })}
          />

          <DebtFormDialogFooter
            isEdit={isEdit}
            submitting={submitting}
            onCancel={() => onOpenChange(false)}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
