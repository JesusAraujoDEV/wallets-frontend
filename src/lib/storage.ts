import { Account, Category, Transaction } from "./types";

// Event bus for reactive updates
const bus = new EventTarget();
export const onDataChange = (handler: () => void) => {
  const fn = () => handler();
  bus.addEventListener("data", fn);
  return () => bus.removeEventListener("data", fn);
};
const emit = () => bus.dispatchEvent(new Event("data"));

const API_BASE = "/api"; // Works on Vercel serverless functions

async function fetchJSON<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input as any, { headers: { "content-type": "application/json" }, ...init });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
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
    accountsCache = await fetchJSON<Account[]>(`${API_BASE}/accounts`);
    emit();
  },
  async upsert(account: Account): Promise<void> {
    await fetchJSON(`${API_BASE}/accounts`, { method: "POST", body: JSON.stringify(account) });
    const idx = accountsCache.findIndex(a => a.id === account.id);
    if (idx >= 0) accountsCache[idx] = account; else accountsCache.push(account);
    emit();
  },
  async remove(id: string): Promise<void> {
    await fetchJSON(`${API_BASE}/accounts?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    accountsCache = accountsCache.filter(a => a.id !== id);
    emit();
  },
};

// Categories
export const CategoriesStore = {
  all(): Category[] {
    return categoriesCache;
  },
  async refresh(): Promise<void> {
    categoriesCache = await fetchJSON<Category[]>(`${API_BASE}/categories`);
    emit();
  },
  async upsert(category: Category): Promise<void> {
    await fetchJSON(`${API_BASE}/categories`, { method: "POST", body: JSON.stringify(category) });
    const idx = categoriesCache.findIndex(c => c.id === category.id);
    if (idx >= 0) categoriesCache[idx] = category; else categoriesCache.push(category);
    emit();
  },
  async remove(id: string): Promise<void> {
    await fetchJSON(`${API_BASE}/categories?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    categoriesCache = categoriesCache.filter(c => c.id !== id);
    emit();
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
    transactionsCache = await fetchJSON<Transaction[]>(`${API_BASE}/transactions`);
    emit();
  },
  async add(tx: Transaction): Promise<void> {
    await fetchJSON(`${API_BASE}/transactions`, { method: "POST", body: JSON.stringify(tx) });
    transactionsCache.push(tx);
    // Adjust account balance client-side (simple approach)
    try {
      const acc = accountsCache.find(a => a.id === tx.accountId);
      if (acc) {
        const delta = tx.type === "income" ? tx.amount : -tx.amount;
        acc.balance = Number(((acc.balance || 0) + delta).toFixed(2));
        await AccountsStore.upsert(acc);
      }
    } catch {}
    emit();
  },
  async remove(id: string): Promise<void> {
    // Need the transaction to revert its effect
    const existing = this.getById(id);
    await fetchJSON(`${API_BASE}/transactions?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    transactionsCache = transactionsCache.filter(t => t.id !== id);
    if (existing) {
      try {
        const acc = accountsCache.find(a => a.id === existing.accountId);
        if (acc) {
          const revert = existing.type === "income" ? -existing.amount : existing.amount;
          acc.balance = Number(((acc.balance || 0) + revert).toFixed(2));
          await AccountsStore.upsert(acc);
        }
      } catch {}
    }
    emit();
  },
  async update(next: Transaction): Promise<void> {
    const prev = this.getById(next.id);
    await fetchJSON(`${API_BASE}/transactions`, { method: "POST", body: JSON.stringify(next) });
    const idx = transactionsCache.findIndex(t => t.id === next.id);
    if (idx >= 0) transactionsCache[idx] = next; else transactionsCache.push(next);
    // Reconcile account balances
    try {
      if (prev) {
        // Revert prev
        const prevAcc = accountsCache.find(a => a.id === prev.accountId);
        if (prevAcc) {
          const prevDelta = prev.type === "income" ? prev.amount : -prev.amount;
          prevAcc.balance = Number(((prevAcc.balance || 0) - prevDelta).toFixed(2));
          await AccountsStore.upsert(prevAcc);
        }
        // Apply next
        const nextAcc = accountsCache.find(a => a.id === next.accountId);
        if (nextAcc) {
          const nextDelta = next.type === "income" ? next.amount : -next.amount;
          nextAcc.balance = Number(((nextAcc.balance || 0) + nextDelta).toFixed(2));
          await AccountsStore.upsert(nextAcc);
        }
      }
    } catch {}
    emit();
  },
};

// Utility for generating IDs
export function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Kick off initial loads (best-effort). In local Vite dev, these routes require a Vercel dev server or proxy.
(async () => {
  try { await AccountsStore.refresh(); } catch {}
  try { await CategoriesStore.refresh(); } catch {}
  try { await TransactionsStore.refresh(); } catch {}
})();
