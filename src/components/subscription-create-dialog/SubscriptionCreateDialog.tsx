import { useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateSubscriptionMutation } from "./useCreateSubscriptionMutation";
import { useSubscriptionReferenceData } from "./useSubscriptionReferenceData";
import { SubscriptionDescriptionTypeFields } from "./SubscriptionDescriptionTypeFields";
import { SubscriptionAmountCurrencyFields } from "./SubscriptionAmountCurrencyFields";
import { SubscriptionCategoryAccountFields } from "./SubscriptionCategoryAccountFields";
import { SubscriptionDebtLinkField } from "./SubscriptionDebtLinkField";
import { SubscriptionScheduleFields } from "./SubscriptionScheduleFields";
import { SubscriptionCreateDialogFooter } from "./SubscriptionCreateDialogFooter";
import { INITIAL_VALUES, type CreateSubscriptionForm, type SubscriptionCreateDialogProps } from "./types";

export function SubscriptionCreateDialog({
  open,
  onOpenChange,
  initialType,
  lockType = false,
  onCreated,
}: SubscriptionCreateDialogProps) {
  const { accounts, categories, activeDebts } = useSubscriptionReferenceData();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateSubscriptionForm>({
    defaultValues: INITIAL_VALUES,
  });

  const selectedMode = watch("execution_mode");
  const selectedFrequency = watch("frequency");
  const selectedSubType = watch("subscriptionType");

  useEffect(() => {
    if (open) {
      reset({
        ...INITIAL_VALUES,
        subscriptionType: initialType ?? INITIAL_VALUES.subscriptionType,
        next_date: new Date().toISOString().slice(0, 10),
      });
    }
  }, [open, initialType, reset]);

  const { createMutation, onSubmitCreate } = useCreateSubscriptionMutation({
    handleSubmit,
    reset,
    onOpenChange,
    onCreated,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full max-w-md sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>Crear nueva suscripción</DialogTitle>
          <DialogDescription>
            Define la regla de cobro, elige si será auto-pago o confirmación manual y activa la recurrencia.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onSubmitCreate}>
          <SubscriptionDescriptionTypeFields
            register={register}
            errors={errors}
            selectedSubType={selectedSubType}
            lockType={lockType}
            onTypeChange={(type) => {
              setValue("subscriptionType", type);
              setValue("debtId", "");
            }}
          />

          <SubscriptionAmountCurrencyFields
            register={register}
            errors={errors}
            currency={watch("currency")}
            onCurrencyChange={(currency) => setValue("currency", currency)}
          />

          <SubscriptionCategoryAccountFields
            categories={categories}
            categoryId={watch("categoryId")}
            onCategoryChange={(id) => setValue("categoryId", id, { shouldValidate: true })}
            filterType={selectedSubType === "ingreso" ? "income" : "expense"}
            accounts={accounts}
            accountId={watch("accountId")}
            onAccountChange={(id) => setValue("accountId", id, { shouldValidate: true })}
          />

          <SubscriptionDebtLinkField
            activeDebts={activeDebts}
            debtId={watch("debtId")}
            onDebtChange={(id) => setValue("debtId", id, { shouldValidate: true })}
            subscriptionType={selectedSubType}
          />

          <SubscriptionScheduleFields
            frequency={selectedFrequency}
            onFrequencyChange={(value) => setValue("frequency", value, { shouldValidate: true })}
            nextDate={watch("next_date")}
            onNextDateChange={(date) => setValue("next_date", date, { shouldValidate: true })}
            executionMode={selectedMode}
            onExecutionModeChange={(mode) => setValue("execution_mode", mode)}
          />

          <SubscriptionCreateDialogFooter
            onCancel={() => onOpenChange(false)}
            isPending={createMutation.isPending}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
