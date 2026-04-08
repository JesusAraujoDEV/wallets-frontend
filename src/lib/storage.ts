import {
  Account,
  Category,
  CategoryGroup,
  CategoryGroupAssignCategoriesPayload,
  CategoryGroupAssignCategoriesResponse,
  CategoryGroupDeleteResponse,
  CategoryGroupUpsertPayload,
  TransferCreatePayload,
  TransferCreateResponse,
  Transaction,
} from "./types";
import { apiFetch } from "./http";

type ApiCategoryGroup = {
  id: number;
  name: string;
  type?: "ingreso" | "gasto" | "neutral";
  analyticsBehavior?: "include" | "exclude";
  analytics_behavior?: "include" | "exclude";
};

type ApiCategory = {
  id: number | string;
  name: string;
  type: "ingreso" | "gasto" | "income" | "expense";
  icon?: string | null;
  color?: string;
  colorName?: string;
  groupId?: number | string | null;
  group_id?: number | string | null;
  group?: ApiCategoryGroup | null;
};

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

export async function trackedApiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    inFlight++;
    emitNet();
    return await apiFetch<T>(path, init);
  } finally {
    inFlight = Math.max(0, inFlight - 1);
    emitNet();
  }
}

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  return trackedApiFetch<T>(path, init);
}

// In-memory caches to keep sync API surface for components
let accountsCache: Account[] = [];
let categoriesCache: Category[] = [];
let transactionsCache: Transaction[] = [];

export async function fetchCategoryGroups(): Promise<CategoryGroup[]> {
  const list = await fetchJSON<ApiCategoryGroup[]>(`category-groups`);
  return (list || []).map((g) => ({
    id: Number(g.id),
    name: String(g.name),
    type: g.type === "ingreso" || g.type === "gasto" || g.type === "neutral" ? g.type : "neutral",
    analyticsBehavior:
      g.analyticsBehavior === "include" || g.analyticsBehavior === "exclude"
        ? g.analyticsBehavior
        : g.analytics_behavior === "include" || g.analytics_behavior === "exclude"
          ? g.analytics_behavior
          : "include",
  }));
}

export async function createCategoryGroup(payload: CategoryGroupUpsertPayload): Promise<CategoryGroup> {
  const created = await fetchJSON<ApiCategoryGroup>(`category-groups`, {
    method: "POST",
    body: JSON.stringify({
      name: payload.name,
      type: payload.type,
      analyticsBehavior: payload.analyticsBehavior,
    }),
  });
  return {
    id: Number(created.id),
    name: String(created.name),
    type: created.type === "ingreso" || created.type === "gasto" || created.type === "neutral" ? created.type : "neutral",
    analyticsBehavior:
      created.analyticsBehavior === "include" || created.analyticsBehavior === "exclude"
        ? created.analyticsBehavior
        : created.analytics_behavior === "include" || created.analytics_behavior === "exclude"
          ? created.analytics_behavior
          : "include",
  };
}

export async function updateCategoryGroup(id: number, payload: CategoryGroupUpsertPayload): Promise<CategoryGroup> {
  const updated = await fetchJSON<ApiCategoryGroup>(`category-groups?id=${encodeURIComponent(String(id))}`, {
    method: "PATCH",
    body: JSON.stringify({
      name: payload.name,
      type: payload.type,
      analyticsBehavior: payload.analyticsBehavior,
    }),
  });
  return {
    id: Number(updated.id),
    name: String(updated.name),
    type: updated.type === "ingreso" || updated.type === "gasto" || updated.type === "neutral" ? updated.type : "neutral",
    analyticsBehavior:
      updated.analyticsBehavior === "include" || updated.analyticsBehavior === "exclude"
        ? updated.analyticsBehavior
        : updated.analytics_behavior === "include" || updated.analytics_behavior === "exclude"
          ? updated.analytics_behavior
          : "include",
  };
}

export async function deleteCategoryGroup(id: number): Promise<CategoryGroupDeleteResponse> {
  return fetchJSON<CategoryGroupDeleteResponse>(`category-groups?id=${encodeURIComponent(String(id))}`, {
    method: "DELETE",
  });
}

export async function assignCategoriesToGroup(
  groupId: number,
  categoryIds: number[],
): Promise<CategoryGroupAssignCategoriesResponse> {
  const payload: CategoryGroupAssignCategoriesPayload = { categoryIds };
  return fetchJSON<CategoryGroupAssignCategoriesResponse>(`category-groups/${encodeURIComponent(String(groupId))}/assign-categories`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

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
    const list = await fetchJSON<ApiCategory[]>(`categories`);
    categoriesCache = (list || []).map((c) => ({
      id: String(c.id),
      name: String(c.name),
      type: (c.type === "ingreso" || c.type === "income") ? "income" : "expense",
      icon: c.icon ?? null,
      color: c.color || "hsl(var(--chart-6))",
      colorName: c.colorName || "",
      groupId: Number(c.groupId ?? c.group_id ?? 0),
      group: c.group
        ? {
            id: Number(c.group.id),
            name: String(c.group.name),
            type: c.group.type === "ingreso" || c.group.type === "gasto" || c.group.type === "neutral" ? c.group.type : "neutral",
            analyticsBehavior:
              c.group.analyticsBehavior === "include" || c.group.analyticsBehavior === "exclude"
                ? c.group.analyticsBehavior
                : c.group.analytics_behavior === "include" || c.group.analytics_behavior === "exclude"
                  ? c.group.analytics_behavior
                  : "include",
          }
        : undefined,
    }));
    emit();
  },
  async upsert(category: Category): Promise<void> {
    const exists = categoriesCache.some(c => c.id === category.id);
    const payload: Record<string, unknown> = {
      name: category.name,
      type: category.type,
      icon: category.icon ?? null,
      color: category.color,
      colorName: category.colorName,
    };
    if (category.groupId != null) {
      payload.groupId = Number(category.groupId);
    }
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
      const rawType = String(t.type ?? '').toLowerCase();
      const type = (rawType === 'income' || rawType === 'ingreso')
        ? 'income'
        : (rawType === 'expense' || rawType === 'gasto')
          ? 'expense'
          : (cat?.type ?? 'expense');
      const statusRaw = String(t.status ?? '').toLowerCase();
      const status: Transaction['status'] = statusRaw === 'pending'
        ? 'pending'
        : statusRaw === 'completed'
          ? 'completed'
          : undefined;
      return {
        id: String(t.id),
        date: String(t.date),
        description: String(t.description ?? ""),
        categoryId,
        accountId,
        amount: Number(t.amount || 0),
        type,
        status,
        currency: (t.currency || undefined),
        amountUsd: t.amount_usd ?? t.amountUsd ?? null,
        exchangeRateUsed: t.exchange_rate_used ?? t.exchangeRateUsed ?? null,
      } as Transaction;
    });
    emit();
  },
  async add(tx: Transaction, options?: { commission?: number }): Promise<void> {
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
      ...(options?.commission != null && options.commission !== 0 ? { commission: Number(options.commission) } : {}),
    } as any;
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

// Transfers
export const TransfersStore = {
  async create(params: {
    fromAccountId: string | number;
    toAccountId: string | number;
    amount: number;
    destinationAmount: number;
    commission?: number;
    date: string;
    concept?: string;
  }): Promise<void> {
    const payload: TransferCreatePayload = {
      fromAccountId: Number(params.fromAccountId),
      toAccountId: Number(params.toAccountId),
      amount: Number(params.amount),
      destinationAmount: Number(params.destinationAmount),
      date: params.date,
      ...(params.commission != null && params.commission !== undefined && params.commission !== 0
        ? { commission: Number(params.commission) }
        : {}),
      ...(params.concept && params.concept.trim() ? { concept: params.concept.trim() } : {}),
    };
    await fetchJSON<TransferCreateResponse>(`transactions/transfer`, { method: "POST", body: JSON.stringify(payload) });
    await AccountsStore.refresh().catch(() => {});
    await TransactionsStore.refresh();
  },
};

// Utility for generating IDs
export function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Initial loads will be triggered from a top-level place (e.g., Index.tsx) to avoid duplicate GETs.
