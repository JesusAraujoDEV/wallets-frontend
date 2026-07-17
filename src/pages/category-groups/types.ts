import type { Category, CategoryGroup } from "@/lib/types";

export type GroupForm = {
  name: string;
  type: "ingreso" | "gasto" | "neutral";
  analyticsBehavior: "include" | "exclude";
};

export const emptyForm: GroupForm = {
  name: "",
  type: "gasto",
  analyticsBehavior: "include",
};

export const mapGroupTypeToCategoryType = (groupType: CategoryGroup["type"]): Category["type"] | null => {
  if (groupType === "ingreso") return "income";
  if (groupType === "gasto") return "expense";
  return null;
};
