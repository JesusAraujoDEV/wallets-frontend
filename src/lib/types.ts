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
  groupId: number;
  group?: CategoryGroup;
}

export interface CategoryGroup {
  id: number;
  name: string;
  description?: string | null;
}

export interface Transaction {
  id: string;
  date: string; // ISO date (YYYY-MM-DD)
  description: string;
  categoryId: string; // references Category.id
  accountId: string;  // references Account.id
  amount: number;
  type: "income" | "expense";
  // Optional server-enriched fields
  currency?: "USD" | "EUR" | "VES";
  amountUsd?: number | null;
  exchangeRateUsed?: number | null;
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

export interface GenericSuccessResponse {
  success: boolean;
  message: string;
  data: Record<string, never>;
}
