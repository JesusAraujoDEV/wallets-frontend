import { buildApiUrl, getToken, apiFetch } from "@/lib/http";

export type TransferExportFormat = "pdf" | "xlsx";

export type TransferExportOptions = {
  format: TransferExportFormat;
  method?: "GET" | "POST"; // default GET for simple filters, POST for complex bodies
  fromDate?: string; // YYYY-MM-DD
  toDate?: string;   // YYYY-MM-DD
  accountId?: string | number;
  includeCommission?: boolean;
  timezone?: string;
};

// Backward compatible signature: exportTransfers("pdf") still works.
export async function exportTransfers(options: TransferExportFormat | TransferExportOptions): Promise<void> {
  const opts: TransferExportOptions = typeof options === "string" ? { format: options } : options;

  // Build endpoint URL. Adjust the path if your backend uses a different route.
  const basePath = `transactions/transfer/export`;
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers["authorization"] = `Bearer ${token}`;

  const toQueryParams = () => {
    const params = new URLSearchParams();
    params.set("format", opts.format);
    if (opts.fromDate) params.set("from_date", opts.fromDate);
    if (opts.toDate) params.set("to_date", opts.toDate);
    if (opts.accountId != null) params.set("account_id", String(opts.accountId));
    if (opts.includeCommission != null) params.set("include_commission", opts.includeCommission ? "true" : "false");
    if (opts.timezone) params.set("timezone", opts.timezone);
    return params;
  };

  // Choose method: default GET unless explicitly set to POST
  const method = opts.method || "GET";
  let res: Response;
  if (method === "GET") {
    const qp = toQueryParams();
    // Backend expects accountId in GET (camelCase), but account_id in POST.
    if (opts.accountId != null) {
      qp.delete("account_id");
      qp.set("accountId", String(opts.accountId));
    }
    const url = buildApiUrl(`${basePath}?${qp.toString()}`);
    res = await fetch(url, { headers });
  } else {
    // Send format in query as per backend contract, body carries filters if any
    const qp = new URLSearchParams();
    qp.set("format", opts.format);
    const url = buildApiUrl(`${basePath}?${qp.toString()}`);
    const body: Record<string, any> = {
      ...(opts.fromDate ? { from_date: opts.fromDate } : {}),
      ...(opts.toDate ? { to_date: opts.toDate } : {}),
      ...(opts.accountId != null ? { account_id: opts.accountId } : {}),
      ...(opts.includeCommission != null ? { include_commission: !!opts.includeCommission } : {}),
      ...(opts.timezone ? { timezone: opts.timezone } : {}),
    };
    headers["content-type"] = "application/json";
    res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try { message = await res.text(); } catch {}
    throw new Error(message || `HTTP ${res.status}`);
  }
  const blob = await res.blob();
  const contentDisposition = res.headers.get("content-disposition") || "";
  let filename = `transfers_${new Date().toISOString().slice(0,10)}.${opts.format === "xlsx" ? "xlsx" : "pdf"}`;
  const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(contentDisposition || "");
  const encName = match?.[1] || match?.[2];
  if (encName) {
    try { filename = decodeURIComponent(encName); } catch { filename = encName; }
  }
  const blobUrl = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  }
}

// New: EPIC PDF export (POST /transactions/transfer/export?format=pdf) with JSON body
export async function exportTransfersEpicPdf(body: {
  items: any[];
  accounts: any[];
  categories: any[];
  title?: string;
  createdBy?: string;
}): Promise<void> {
  const url = buildApiUrl(`transactions/transfer/export?format=pdf`);
  const headers: Record<string, string> = { "content-type": "application/json" };
  const token = getToken();
  if (token) headers["authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try { message = await res.text(); } catch {}
    throw new Error(message || `HTTP ${res.status}`);
  }
  const blob = await res.blob();
  const contentDisposition = res.headers.get("content-disposition") || "";
  let filename = body.title ? `${body.title}.pdf` : `transfers_${new Date().toISOString().slice(0,10)}.pdf`;
  const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(contentDisposition || "");
  const encName = match?.[1] || match?.[2];
  if (encName) {
    try { filename = decodeURIComponent(encName); } catch { filename = encName; }
  }
  const blobUrl = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  }
}

// Convenience: auto-fetch items/accounts/categories and export EPIC PDF
export async function exportTransfersEpicPdfAuto(options?: {
  title?: string;
  createdBy?: string;
  pageSize?: number; // default 50
}): Promise<void> {
  const pageSize = options?.pageSize ?? 50;
  // Fetch in parallel
  const [txns, accounts, categories] = await Promise.all([
    apiFetch<any>(`transactions?grouped=1&pageSize=${pageSize}`),
    apiFetch<any[]>(`accounts`),
    apiFetch<any[]>(`categories`),
  ]);
  const items = Array.isArray(txns?.items) ? txns.items : (Array.isArray(txns) ? txns : []);
  return exportTransfersEpicPdf({
    items,
    accounts: accounts || [],
    categories: categories || [],
    title: options?.title,
    createdBy: options?.createdBy,
  });
}

export async function exportTransactionsFromData(args: {
  format: TransferExportFormat;
  data: {
    items: any[];
    accounts?: any[];
    categories?: any[];
    title?: string;
    createdBy?: string;
  };
}): Promise<void> {
  const token = getToken();
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (token) headers["authorization"] = `Bearer ${token}`;

  const qp = new URLSearchParams();
  qp.set("format", args.format);
  const url = buildApiUrl(`transactions/transfer/export?${qp.toString()}`);
  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(args.data) });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try { message = await res.text(); } catch {}
    throw new Error(message || `HTTP ${res.status}`);
  }
  const blob = await res.blob();
  const contentDisposition = res.headers.get("content-disposition") || "";
  let filename = `transfers_${new Date().toISOString().slice(0,10)}.${args.format === "xlsx" ? "xlsx" : "pdf"}`;
  const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(contentDisposition || "");
  const encName = match?.[1] || match?.[2];
  if (encName) {
    try { filename = decodeURIComponent(encName); } catch { filename = encName; }
  }
  const blobUrl = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  }
}

// Export ALL transactions via server endpoint with filters (GET /transactions/export)
export type TransactionsExportFilters = {
  searchQuery?: string;
  filterType?: "all" | "income" | "expense";
  filterIncomeCategories?: string[];
  filterExpenseCategories?: string[];
  filterAccounts?: string[];
  dateMode?: "none" | "day" | "range" | "month";
  filterDate?: string; // YYYY-MM-DD
  filterDateFrom?: string; // YYYY-MM-DD
  filterDateTo?: string; // YYYY-MM-DD
  filterMonth?: string; // YYYY-MM
};

export async function exportAllTransactions(params: {
  format: TransferExportFormat;
  includeInStats?: boolean; // default true
  filters?: TransactionsExportFilters;
}): Promise<void> {
  const { format, filters } = params;
  const includeInStatsFlag = params.includeInStats === false ? "0" : "1";
  const qp = new URLSearchParams();
  qp.set("format", format);
  qp.set("includeInStats", includeInStatsFlag);
  if (filters) {
    const {
      searchQuery,
      filterType,
      filterIncomeCategories,
      filterExpenseCategories,
      filterAccounts,
      dateMode,
      filterDate,
      filterDateFrom,
      filterDateTo,
      filterMonth,
    } = filters;
    if (searchQuery && searchQuery.trim()) qp.set("q", searchQuery.trim());
    if (filterType && filterType !== "all") qp.set("type", filterType);
    const cats = [
      ...(filterIncomeCategories || []),
      ...(filterExpenseCategories || []),
    ];
    if (cats.length > 0) qp.set("categoryId", cats.join(","));
    if (filterAccounts && filterAccounts.length > 0) qp.set("accountId", filterAccounts.join(","));
    if (dateMode === "day" && filterDate) qp.set("date", filterDate);
    else if (dateMode === "range") {
      if (filterDateFrom) qp.set("dateFrom", filterDateFrom);
      if (filterDateTo) qp.set("dateTo", filterDateTo);
    } else if (dateMode === "month" && filterMonth) qp.set("month", filterMonth);
  }

  const url = buildApiUrl(`transactions/export?${qp.toString()}`);
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers["authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try { message = await res.text(); } catch {}
    throw new Error(message || `HTTP ${res.status}`);
  }
  const blob = await res.blob();
  const contentDisposition = res.headers.get("content-disposition") || "";
  let filename = `transactions_${new Date().toISOString().slice(0,10)}.${format === "xlsx" ? "xlsx" : "pdf"}`;
  const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(contentDisposition || "");
  const encName = match?.[1] || match?.[2];
  if (encName) {
    try { filename = decodeURIComponent(encName); } catch { filename = encName; }
  }
  const blobUrl = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  }
}
