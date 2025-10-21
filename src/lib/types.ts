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
  color: string; // CSS color value
  colorName: string;
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
