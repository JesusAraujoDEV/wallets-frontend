import { useState } from "react";
import { EMPTY_OTP, type OtpDigits } from "./types";

export function useEmailChangeDialogState() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [currentPassword, setCurrentPassword] = useState("");
  const [oldEmailCodeDigits, setOldEmailCodeDigits] = useState<OtpDigits>(EMPTY_OTP);
  const [newEmail, setNewEmail] = useState("");
  const [newEmailCodeDigits, setNewEmailCodeDigits] = useState<OtpDigits>(EMPTY_OTP);

  const resetFlow = () => {
    setStep(1);
    setCurrentPassword("");
    setOldEmailCodeDigits(EMPTY_OTP);
    setNewEmail("");
    setNewEmailCodeDigits(EMPTY_OTP);
  };

  const openDialog = () => {
    resetFlow();
    setOpen(true);
  };

  const onOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) resetFlow();
  };

  return {
    open, onOpenChange, openDialog, resetFlow, step, setStep,
    currentPassword, setCurrentPassword,
    oldEmailCodeDigits, setOldEmailCodeDigits,
    newEmail, setNewEmail,
    newEmailCodeDigits, setNewEmailCodeDigits,
  };
}
