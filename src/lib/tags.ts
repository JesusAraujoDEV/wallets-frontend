import { apiFetch } from "@/lib/http";
import type { Tag } from "@/lib/types";

export async function fetchTags(): Promise<Tag[]> {
  return apiFetch<Tag[]>("tags");
}

export async function createTag(data: { name: string; color?: string; icon?: string }): Promise<Tag> {
  return apiFetch<Tag>("tags", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTag(id: number, data: { name?: string; color?: string; icon?: string }): Promise<Tag> {
  return apiFetch<Tag>(`tags/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteTag(id: number): Promise<void> {
  await apiFetch(`tags/${id}`, { method: "DELETE" });
}

export async function assignTagsToTransaction(transactionId: string, tagIds: number[]): Promise<{ ok: boolean; tags: Tag[] }> {
  return apiFetch(`tags/transaction/${transactionId}`, {
    method: "PUT",
    body: JSON.stringify({ tagIds }),
  });
}

export async function getTransactionTags(transactionId: string): Promise<Tag[]> {
  return apiFetch<Tag[]>(`tags/transaction/${transactionId}`);
}

export async function getTransactionsByTag(tagId: number): Promise<{ tag: Tag; transactions: any[] }> {
  return apiFetch(`tags/${tagId}/transactions`);
}
