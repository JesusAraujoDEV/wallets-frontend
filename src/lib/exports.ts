import { buildApiUrl, getToken } from "@/lib/http";

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
    const url = buildApiUrl(`${basePath}?${toQueryParams().toString()}`);
    res = await fetch(url, { headers });
  } else {
    const url = buildApiUrl(basePath);
    const body: Record<string, any> = {
      format: opts.format,
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
