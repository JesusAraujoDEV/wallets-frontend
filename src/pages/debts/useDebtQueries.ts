import { useQuery } from "@tanstack/react-query";
import { DEBTS_QUERY_KEY, fetchDebts } from "@/lib/debts";

export function useDebtQueries() {
  const debtsQuery = useQuery({
    queryKey: DEBTS_QUERY_KEY,
    queryFn: fetchDebts,
  });

  const debts = debtsQuery.data ?? [];
  const payableDebts = debts.filter((d) => d.type === "payable" && d.status !== "paid");
  const receivableDebts = debts.filter((d) => d.type === "receivable" && d.status !== "paid");
  const resolvedDebts = debts.filter((d) => d.status === "paid");

  return { debtsQuery, payableDebts, receivableDebts, resolvedDebts };
}
