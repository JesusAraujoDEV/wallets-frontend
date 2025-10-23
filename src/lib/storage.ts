import { Account, Category, Transaction } from "./types";
import { apiFetch } from "./http";

// Event bus for reactive updates
const bus = new EventTarget();
export const onDataChange = (handler: () => void) => {
  const fn = () => handler();
  bus.addEventListener("data", fn);
  return () => bus.removeEventListener("data", fn);
};
const emit = () => bus.dispatchEvent(new Event("data"));

// Global network activity tracker
let inFlight = 0;
export const onNetworkActivity = (handler: (count: number) => void) => {
  const fn = () => handler(inFlight);
  bus.addEventListener("net", fn);
  return () => bus.removeEventListener("net", fn);
};
const emitNet = () => bus.dispatchEvent(new Event("net"));

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    inFlight++;
    emitNet();
    return await apiFetch<T>(path, init);
  } finally {
    inFlight = Math.max(0, inFlight - 1);
    emitNet();
  }
}

// In-memory caches to keep sync API surface for components
let accountsCache: Account[] = [];
let categoriesCache: Category[] = [];
let transactionsCache: Transaction[] = [];

// Accounts
export const AccountsStore = {
  all(): Account[] {
    return accountsCache;
  },
  async refresh(): Promise<void> {
    const list = await fetchJSON<any[]>(`accounts`);
    accountsCache = (list || []).map((a) => ({
      id: String(a.id),
      name: String(a.name),
      currency: (a.currency || "USD") as Account["currency"],
      balance: Number(a.balance || 0),
    }));
    emit();
  },
  async upsert(account: Account): Promise<void> {
    const exists = accountsCache.some(a => a.id === account.id);
    if (exists) {
      const payload = { name: account.name, currency: account.currency };
      await fetchJSON(`accounts?id=${encodeURIComponent(account.id)}`, { method: "PATCH", body: JSON.stringify(payload) });
    } else {
      const payload = { name: account.name, type: "ahorros", currency: account.currency, balance: account.balance };
      await fetchJSON(`accounts`, { method: "POST", body: JSON.stringify(payload) });
    }
    await this.refresh();
  },
  async remove(id: string): Promise<void> {
    await fetchJSON(`accounts?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    await this.refresh();
  },
};

// Categories
export const CategoriesStore = {
  all(): Category[] {
    return categoriesCache;
  },
  async refresh(): Promise<void> {
    const list = await fetchJSON<any[]>(`categories`);
    categoriesCache = (list || []).map((c) => ({
      id: String(c.id),
      name: String(c.name),
      type: (c.type === "ingreso" || c.type === "income") ? "income" : (c.type === "expense" || c.type === "gasto") ? "expense" : (c.type as any) || "expense",
      icon: c.icon ?? null,
      color: c.color || "hsl(var(--chart-6))",
      colorName: c.colorName || "",
    }));
    emit();
  },
  async upsert(category: Category): Promise<void> {
    const exists = categoriesCache.some(c => c.id === category.id);
    const payload = {
      name: category.name,
      type: category.type,
      icon: category.icon ?? null,
      color: category.color,
      colorName: category.colorName,
    };
    if (exists) {
      await fetchJSON(`categories?id=${encodeURIComponent(category.id)}`, { method: "PATCH", body: JSON.stringify(payload) });
    } else {
      await fetchJSON(`categories`, { method: "POST", body: JSON.stringify(payload) });
    }
    await this.refresh();
  },
  async remove(id: string): Promise<void> {
    await fetchJSON(`categories?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    await this.refresh();
  },
};

// Transactions
export const TransactionsStore = {
  all(): Transaction[] {
    return transactionsCache;
  },
  getById(id: string): Transaction | undefined {
    return transactionsCache.find(t => t.id === id);
  },
  async refresh(): Promise<void> {
    const list = await fetchJSON<any[]>(`transactions`);
    transactionsCache = (list || []).map((t) => {
      const categoryId = String(t.categoryId ?? t.category_id);
      const accountId = String(t.accountId ?? t.account_id);
      const cat = categoriesCache.find(c => c.id === categoryId);
      const type = (t.type === "income" || t.type === "expense") ? t.type : (cat?.type ?? "expense");
      return {
        id: String(t.id),
        date: String(t.date),
        description: String(t.description ?? ""),
        categoryId,
        accountId,
        amount: Number(t.amount || 0),
        type,
        currency: (t.currency || undefined),
        amountUsd: t.amount_usd ?? t.amountUsd ?? null,
        exchangeRateUsed: t.exchange_rate_used ?? t.exchangeRateUsed ?? null,
      } as Transaction;
    });
    emit();
  },
  async add(tx: Transaction): Promise<void> {
    const acc = accountsCache.find(a => a.id === tx.accountId);
    const currency = acc?.currency;
    if (!currency) throw new Error("Missing account currency for transaction POST");
    const payload = {
      description: tx.description,
      amount: tx.amount,
      currency,
      date: tx.date,
      categoryId: Number(tx.categoryId),
      accountId: Number(tx.accountId),
    };
    await fetchJSON(`transactions`, { method: "POST", body: JSON.stringify(payload) });
    await AccountsStore.refresh().catch(() => {});
    await this.refresh();
  },
  async remove(id: string): Promise<void> {
    await fetchJSON(`transactions?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    await AccountsStore.refresh().catch(() => {});
    await this.refresh();
  },
  async update(next: Transaction): Promise<void> {
    const acc = accountsCache.find(a => a.id === next.accountId);
    const currency = acc?.currency;
    if (!currency) throw new Error("Missing account currency for transaction PATCH");
    const payload = {
      description: next.description,
      amount: next.amount,
      currency,
      date: next.date,
      categoryId: Number(next.categoryId),
      accountId: Number(next.accountId),
    };
    await fetchJSON(`transactions?id=${encodeURIComponent(next.id)}`, { method: "PATCH", body: JSON.stringify(payload) });
    await AccountsStore.refresh().catch(() => {});
    await this.refresh();
  },
};

// Utility for generating IDs
export function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Initial loads will be triggered from a top-level place (e.g., Index.tsx) to avoid duplicate GETs.
