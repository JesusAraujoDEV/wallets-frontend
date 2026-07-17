import { useQuery } from "@tanstack/react-query";
import { DEBTS_QUERY_KEY, fetchDebts } from "@/lib/debts";

export function useDebtQueries() {
  const debtsQuery = useQuery({
    queryKey: DEBTS_QUERY_KEY,
    queryFn: fetchDebts,
  });

  const debts = debtsQuery.data ?? [];
  const payableDebts = debts.filter((d) => d.type === "payable");
  const receivableDebts = debts.filter((d) => d.type === "receivable");

  return { debtsQuery, payableDebts, receivableDebts };
}
