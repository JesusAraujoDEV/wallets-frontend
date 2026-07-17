export type ProfileEditFormValues = {
  name: string;
  email: string;
  username: string;
};

export type OtpDigits = string[];

export const EMPTY_OTP: OtpDigits = ["", "", "", "", "", ""];

export function errorDescription(error: unknown) {
  return error instanceof Error ? error.message : "Intenta nuevamente.";
}
