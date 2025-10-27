// Centralized icon options for categories, reused across forms and pickers

export const EXPENSE_ICON_OPTIONS: string[] = [
  "ShoppingCart","ShoppingBag","ShoppingBasket","Store",
  "Gift","Percent","Receipt","Banknote",
  "Scissors","Users","Home","Car",
  "Fuel","Droplet","Film","Ticket",
  "Gamepad2","Tv","Puzzle","Paperclip",
  "FileText","PenLine","Pencil","Utensils",
  "Pizza","Shirt","SquareParking","Cloud",
  "Database","GraduationCap","Music2"
];

export const INCOME_ICON_OPTIONS: string[] = [
  "Wallet","PiggyBank","Banknote","DollarSign",
  "Coins","ArrowLeftRight","Users","Home",
  "Heart","Calendar","CalendarCheck","Briefcase",
  "CheckCircle2","FileCheck","PackageCheck","BadgeCheck",
  "BriefcaseMedical","Hospital","ShoppingBasket","CreditCard","Gamepad2"
];

export function getIconOptionsForType(type: "income" | "expense"): string[] {
  return type === "expense" ? EXPENSE_ICON_OPTIONS : INCOME_ICON_OPTIONS;
}
