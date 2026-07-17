import { useRef } from "react";
import { Input } from "@/components/ui/input";
import type { OtpDigits } from "./types";

type OtpBoxesInputProps = {
  idPrefix: string;
  value: OtpDigits;
  onChange: (next: OtpDigits) => void;
  disabled?: boolean;
};

export function OtpBoxesInput({ idPrefix, value, onChange, disabled = false }: OtpBoxesInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const setDigitAt = (index: number, rawValue: string) => {
    const lastChar = rawValue.slice(-1);
    const normalized = /\d/.test(lastChar) ? lastChar : "";
    const next = [...value];
    next[index] = normalized;
    onChange(next);

    if (normalized && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !value[index] && index > 0) {
      const next = [...value];
      next[index - 1] = "";
      onChange(next);
      inputRefs.current[index - 1]?.focus();
      event.preventDefault();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
      event.preventDefault();
    }

    if (event.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
      event.preventDefault();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i += 1) {
      next[i] = pasted[i];
    }
    onChange(next);
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
    event.preventDefault();
  };

  return (
    <div className="flex justify-center gap-2 my-4">
      {value.map((digit, index) => (
        <Input
          key={`${idPrefix}-${index}`}
          id={`${idPrefix}-${index}`}
          ref={(node) => {
            inputRefs.current[index] = node;
          }}
          value={digit}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          disabled={disabled}
          className="w-12 h-12 text-center text-xl font-bold rounded-md border"
          onChange={(event) => setDigitAt(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
}
