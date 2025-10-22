import { Account, Category, Transaction } from "./types";

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

const API_BASE = "/api"; // Works on Vercel serverless functions

async function fetchJSON<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  try {
    inFlight++;
    emitNet();
    const res = await fetch(input as any, { headers: { "content-type": "application/json" }, ...init });
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<T>;
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
    accountsCache = await fetchJSON<Account[]>(`${API_BASE}/accounts`);
    emit();
  },
  async upsert(account: Account): Promise<void> {
    const idx = accountsCache.findIndex(a => a.id === account.id);
    const exists = idx >= 0;
    const isNumericId = /^\d+$/.test(account.id);
    if (exists && isNumericId) {
      await fetchJSON(`${API_BASE}/accounts?id=${encodeURIComponent(account.id)}`, { method: "PUT", body: JSON.stringify(account) });
      accountsCache[idx] = account;
      emit();
      return;
    }
    // Create (or fallback for non-numeric legacy ids)
    const created = await fetchJSON<{ ok: boolean; newId: string }>(`${API_BASE}/accounts`, { method: "POST", body: JSON.stringify(account) });
    if (created?.newId) {
      const newId = String(created.newId);
      if (exists) {
        // Replace existing entry id with server id
        accountsCache[idx] = { ...account, id: newId } as Account;
      } else {
        accountsCache.push({ ...account, id: newId } as Account);
      }
    } else {
      // Fallback push/update without id swap
      if (exists) accountsCache[idx] = account; else accountsCache.push(account);
    }
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
    const idx = categoriesCache.findIndex(c => c.id === category.id);
    const exists = idx >= 0;
    const isNumericId = /^\d+$/.test(category.id);
    if (exists && isNumericId) {
      await fetchJSON(`${API_BASE}/categories?id=${encodeURIComponent(category.id)}`, { method: "PUT", body: JSON.stringify(category) });
      categoriesCache[idx] = category;
      emit();
      return;
    }
    const created = await fetchJSON<{ ok: boolean; newId: string }>(`${API_BASE}/categories`, { method: "POST", body: JSON.stringify(category) });
    if (created?.newId) {
      const newId = String(created.newId);
      if (exists) {
        categoriesCache[idx] = { ...category, id: newId } as Category;
      } else {
        categoriesCache.push({ ...category, id: newId } as Category);
      }
    } else {
      if (exists) categoriesCache[idx] = category; else categoriesCache.push(category);
    }
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
    // Backend requires currency; derive it from the selected account
    const acc = accountsCache.find(a => a.id === tx.accountId);
    const currency = acc?.currency;
    if (!currency) {
      throw new Error("Missing account currency for transaction POST");
    }
    // Do not send client-side amountUsd/exchangeRateUsed to force server to compute authoritative values
    const { amountUsd: _omitUsd, exchangeRateUsed: _omitRate, ...rest } = tx as any;
    const created = await fetchJSON<{ ok: boolean; newId: string; tx?: Transaction }>(
      `${API_BASE}/transactions`,
      { method: "POST", body: JSON.stringify({ ...rest, currency }) }
    );
    const serverTx: Transaction = created?.tx ? created.tx : { ...tx, id: created?.newId ? String(created.newId) : tx.id };
    const serverId = serverTx.id;
    transactionsCache.push(serverTx);
    // Adjust account balance client-side only (server already updated it)
    if (acc) {
      const delta = tx.type === "income" ? tx.amount : -tx.amount;
      const newBalance = Number(((acc.balance || 0) + delta).toFixed(2));
      // Replace account object and array reference to trigger React updates
      const idx = accountsCache.findIndex(a => a.id === acc.id);
      if (idx >= 0) {
        accountsCache = [
          ...accountsCache.slice(0, idx),
          { ...accountsCache[idx], balance: newBalance },
          ...accountsCache.slice(idx + 1),
        ];
      }
    }
    emit();
  },
  async remove(id: string): Promise<void> {
    // Need the transaction to revert its effect
    const existing = this.getById(id);
    await fetchJSON(`${API_BASE}/transactions?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    transactionsCache = transactionsCache.filter(t => t.id !== id);
    if (existing) {
      const acc = accountsCache.find(a => a.id === existing.accountId);
      if (acc) {
        const revert = existing.type === "income" ? -existing.amount : existing.amount;
        const newBalance = Number(((acc.balance || 0) + revert).toFixed(2));
        const idx = accountsCache.findIndex(a => a.id === acc.id);
        if (idx >= 0) {
          accountsCache = [
            ...accountsCache.slice(0, idx),
            { ...accountsCache[idx], balance: newBalance },
            ...accountsCache.slice(idx + 1),
          ];
        }
      }
    }
    emit();
  },
  async update(next: Transaction): Promise<void> {
    const prev = this.getById(next.id);
    // Backend needs currency; derive from next account
    const acc = accountsCache.find(a => a.id === next.accountId);
    const currency = acc?.currency;
    if (!currency) throw new Error("Missing account currency for transaction PUT");
    // Strip any client-side amountUsd/exchangeRateUsed; server will recompute for VES
    const { amountUsd: _omitUsd2, exchangeRateUsed: _omitRate2, ...payload } = next as any;
    const resp = await fetchJSON<{ ok: boolean; tx?: Transaction }>(`${API_BASE}/transactions?id=${encodeURIComponent(next.id)}`, { method: "PUT", body: JSON.stringify({ ...payload, currency }) });
    const serverTx: Transaction = resp?.tx ? resp.tx : next;
    const idx = transactionsCache.findIndex(t => t.id === next.id);
    if (idx >= 0) transactionsCache[idx] = serverTx; else transactionsCache.push(serverTx);
    // Reconcile account balances
    if (prev) {
      // Revert prev
      const prevAcc = accountsCache.find(a => a.id === prev.accountId);
      if (prevAcc) {
        const prevDelta = prev.type === "income" ? prev.amount : -prev.amount;
        const newBalance = Number(((prevAcc.balance || 0) - prevDelta).toFixed(2));
        const idx = accountsCache.findIndex(a => a.id === prevAcc.id);
        if (idx >= 0) {
          accountsCache = [
            ...accountsCache.slice(0, idx),
            { ...accountsCache[idx], balance: newBalance },
            ...accountsCache.slice(idx + 1),
          ];
        }
      }
      // Apply next
      const nextAcc = accountsCache.find(a => a.id === serverTx.accountId);
      if (nextAcc) {
        const nextDelta = serverTx.type === "income" ? serverTx.amount : -serverTx.amount;
        const newBalance = Number(((nextAcc.balance || 0) + nextDelta).toFixed(2));
        const idx = accountsCache.findIndex(a => a.id === nextAcc.id);
        if (idx >= 0) {
          accountsCache = [
            ...accountsCache.slice(0, idx),
            { ...accountsCache[idx], balance: newBalance },
            ...accountsCache.slice(idx + 1),
          ];
        }
      }
    }
    emit();
  },
};

// Utility for generating IDs
export function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Initial loads will be triggered from a top-level place (e.g., Index.tsx) to avoid duplicate GETs.
