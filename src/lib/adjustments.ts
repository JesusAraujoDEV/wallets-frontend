import { AccountsStore, CategoriesStore, TransactionsStore, newId } from "@/lib/storage";
import type { Account, Category } from "@/lib/types";

export async function ensureAdjustmentCategory(kind: "income" | "expense"): Promise<Category> {
  const name = kind === "income" ? "Ajuste de Balance (+)" : "Ajuste de Balance (-)";
  let cat = CategoriesStore.all().find(c => c.name === name);
  if (cat) return cat;
  try {
    const newCat: Category = {
      id: newId(),
      name,
      type: kind,
      color: kind === "income" ? "hsl(var(--chart-2))" : "hsl(var(--chart-3))",
      colorName: kind === "income" ? "Lavender" : "Peach",
    };
    await CategoriesStore.upsert(newCat);
    cat = CategoriesStore.all().find(c => c.name === name) || newCat;
    return cat;
  } catch (e) {
    await CategoriesStore.refresh().catch(() => {});
    cat = CategoriesStore.all().find(c => c.name === name);
    if (cat) return cat as Category;
    throw e;
  }
}

export async function createBalanceAdjustmentTransaction(account: Account, nextBalance: number) {
  const prevBalance = account.balance;
  const delta = Number((nextBalance - prevBalance).toFixed(2));
  if (!delta) return;
  const adjType: "income" | "expense" = delta > 0 ? "income" : "expense";
  const adjCat = await ensureAdjustmentCategory(adjType);
  const todayISO = new Date().toISOString().slice(0, 10);
  await TransactionsStore.add({
    id: newId(),
    date: todayISO,
    description: `Ajuste de balance: ${prevBalance.toFixed(2)} → ${nextBalance.toFixed(2)}`,
    categoryId: adjCat.id,
    accountId: account.id,
    amount: Math.abs(delta),
    type: adjType,
  });
  await AccountsStore.refresh().catch(() => {});
}
