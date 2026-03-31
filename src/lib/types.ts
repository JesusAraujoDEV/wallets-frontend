export interface Account {
  id: string;
  name: string;
  currency: "USD" | "EUR" | "VES";
  balance: number;
}

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  icon?: string | null;
  color: string; // CSS color value
  colorName: string;
  groupId?: number | null;
  group?: CategoryGroup;
}

export type CategoryGroupType = "ingreso" | "gasto" | "neutral";
export type CategoryGroupAnalyticsBehavior = "include" | "exclude";

export interface CategoryGroup {
  id: number;
  name: string;
  type: CategoryGroupType;
  analyticsBehavior: CategoryGroupAnalyticsBehavior;
}

export interface CategoryGroupUpsertPayload {
  name: string;
  type: CategoryGroupType;
  analyticsBehavior: CategoryGroupAnalyticsBehavior;
}

export interface CategoryGroupAssignCategoriesPayload {
  categoryIds: number[];
}

export interface CategoryGroupAssignCategoriesResponse {
  ok?: boolean;
  success?: boolean;
  message?: string;
}

export interface CategoryGroupDeleteResponse {
  ok: boolean;
  rowCount: number;
}

export interface Transaction {
  id: string;
  date: string; // ISO date (YYYY-MM-DD)
  description: string;
  categoryId: string; // references Category.id
  accountId: string;  // references Account.id
  amount: number;
  type: "income" | "expense";
  status?: "pending" | "completed";
  // Optional server-enriched fields
  currency?: "USD" | "EUR" | "VES";
  amountUsd?: number | null;
  exchangeRateUsed?: number | null;
}

export type RecurringExecutionMode = "auto" | "manual";

export interface RecurringTransaction {
  id: string;
  amount: number;
  description: string;
  frequency: string;
  next_date: string;
  execution_mode: RecurringExecutionMode;
  is_active: boolean;
  categoryId: string;
  accountId: string;
  currency: "USD" | "EUR" | "VES";
}

export interface RecurringTransactionPayload {
  amount: number;
  description: string;
  frequency: string;
  next_date: string;
  start_date: string;
  type: "gasto" | "ingreso";
  execution_mode: RecurringExecutionMode;
  is_active: boolean;
  categoryId: number;
  accountId?: number;
  currency: "USD" | "EUR" | "VES";
}

export interface UpdateRecurringTransactionPayload {
  description?: string;
  amount?: number;
  frequency?: string;
  startDate?: string;
  nextDate?: string;
  type?: "gasto" | "ingreso";
  executionMode?: RecurringExecutionMode;
  isActive?: boolean;
  categoryId?: number;
  accountId?: number | null;
  currency?: "USD" | "EUR" | "VES";
}

export interface TriggerRecurringResponse {
  ok?: boolean;
  success?: boolean;
  message?: string;
  processed?: number;
}

export interface PayNowRecurringPayload {
  date?: string;
  accountId?: number;
  amount?: number;
  currency?: "USD" | "EUR" | "VES";
}

export interface PayNowRecurringResponse {
  success?: boolean;
  message?: string;
  subscription?: RecurringTransaction;
}

export interface ConfirmPendingTransactionPayload {
  date: string;
  accountId: number;
  amount: number;
  currency: "USD" | "EUR" | "VES";
}

export interface DataBundle {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
}

export interface AuthUser {
  id: string | number;
  username: string;
  email: string;
  name: string;
  authProvider?: "local" | "google";
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface AuthProfileResponse {
  ok: boolean;
  user: AuthUser;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  username?: string;
}

export type UpdateProfileResponse = AuthUser | AuthProfileResponse;

export interface RequestEmailChangePayload {
  currentPassword: string;
}

export interface VerifyOldEmailOtpPayload {
  code: string;
  newEmail: string;
}

export interface ConfirmNewEmailPayload {
  code: string;
  newEmail: string;
}

export interface UnlinkGooglePayload {
  newPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
  data: Record<string, never>;
}

export interface GenericSuccessResponse {
  success: boolean;
  message: string;
  data: Record<string, never>;
}

export interface BudgetCategorySummary {
  id: string;
  name: string;
  icon?: string | null;
  color?: string;
  colorName?: string;
}

export interface BudgetStatus {
  id: string;
  category: BudgetCategorySummary;
  budgeted: number;
  period: BudgetPeriod;
  specific_month?: string | null;
  spent: number;
  remaining: number;
  percentageUsed: number;
}

export type BudgetPeriod = "monthly" | "yearly" | "one_time";

export interface Budget {
  id: string;
  categoryId: string;
  budgeted: number;
  period: BudgetPeriod;
  specific_month?: string | null;
}

export interface CreateBudgetPayload {
  amount: number;
  period: BudgetPeriod;
  specific_month?: string | null;
  categoryId?: number | null;
}

export interface UpdateBudgetPayload {
  amount: number;
  period: BudgetPeriod;
  specific_month: string | null;
  categoryId: number | null;
}

export interface BudgetDeleteResponse {
  ok?: boolean;
  success?: boolean;
  message?: string;
}
