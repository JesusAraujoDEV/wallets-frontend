import { Account, Category, Transaction } from "./types";

const STORAGE_KEYS = {
  accounts: "pwi_accounts",
  categories: "pwi_categories",
  transactions: "pwi_transactions",
} as const;

// Simple event target to broadcast updates across components
const bus = new EventTarget();
export const onDataChange = (handler: () => void) => {
  const fn = () => handler();
  bus.addEventListener("data", fn);
  return () => bus.removeEventListener("data", fn);
};
const emit = () => bus.dispatchEvent(new Event("data"));

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  emit();
}

// Accounts
export const AccountsStore = {
  all(): Account[] {
    return readJSON<Account[]>(STORAGE_KEYS.accounts, []);
  },
  upsert(account: Account) {
    const items = this.all();
    const idx = items.findIndex(a => a.id === account.id);
    if (idx >= 0) items[idx] = account; else items.push(account);
    writeJSON(STORAGE_KEYS.accounts, items);
  },
  remove(id: string) {
    const items = this.all().filter(a => a.id !== id);
    writeJSON(STORAGE_KEYS.accounts, items);
  },
};

// Categories
export const CategoriesStore = {
  all(): Category[] {
    return readJSON<Category[]>(STORAGE_KEYS.categories, []);
  },
  upsert(category: Category) {
    const items = this.all();
    const idx = items.findIndex(c => c.id === category.id);
    if (idx >= 0) items[idx] = category; else items.push(category);
    writeJSON(STORAGE_KEYS.categories, items);
  },
  remove(id: string) {
    const items = this.all().filter(c => c.id !== id);
    writeJSON(STORAGE_KEYS.categories, items);
  },
};

// Transactions
export const TransactionsStore = {
  all(): Transaction[] {
    return readJSON<Transaction[]>(STORAGE_KEYS.transactions, []);
  },
  add(tx: Transaction) {
    // Append transaction
    const items = this.all();
    items.push(tx);
    writeJSON(STORAGE_KEYS.transactions, items);

    // Adjust account balance accordingly
    try {
      const accounts = AccountsStore.all();
      const idx = accounts.findIndex(a => a.id === tx.accountId);
      if (idx >= 0) {
        const delta = tx.type === "income" ? tx.amount : -tx.amount;
        const current = Number(accounts[idx].balance) || 0;
        accounts[idx].balance = Number((current + delta).toFixed(2));
        writeJSON(STORAGE_KEYS.accounts, accounts);
      }
    } catch {
      // no-op if anything goes wrong adjusting balances
    }
  },
  remove(id: string) {
    const items = this.all().filter(t => t.id !== id);
    writeJSON(STORAGE_KEYS.transactions, items);
  },
};

// Utility for generating IDs
export function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
