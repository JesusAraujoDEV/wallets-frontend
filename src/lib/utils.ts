import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Domain utils (keep UI free from business rules) ---

/** Normalize a category name for case-insensitive comparisons */
export function normalizeCategoryName(name: string | null | undefined): string {
  return (name || "").trim().toLowerCase();
}

const ADJ_PLUS = "ajuste de balance (+)";
const ADJ_MINUS = "ajuste de balance (-)";

/** True if the normalized category name represents a balance adjustment (either + or -) */
export function isBalanceAdjustmentCategoryName(normName: string): boolean {
  return normName === ADJ_PLUS || normName === ADJ_MINUS;
}

/** True if the provided raw name is an adjustment category */
export function isBalanceAdjustmentCategory(rawName: string | null | undefined): boolean {
  return isBalanceAdjustmentCategoryName(normalizeCategoryName(rawName));
}

export function isBalanceAdjustmentPlus(rawName: string | null | undefined): boolean {
  return normalizeCategoryName(rawName) === ADJ_PLUS;
}

export function isBalanceAdjustmentMinus(rawName: string | null | undefined): boolean {
  return normalizeCategoryName(rawName) === ADJ_MINUS;
}

