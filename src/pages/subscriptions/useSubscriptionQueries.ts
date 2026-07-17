import { useQuery } from "@tanstack/react-query";
import {
  fetchPendingTransactions,
  fetchRecurringTransactions,
  PENDING_TRANSACTIONS_QUERY_KEY,
  RECURRING_TRANSACTIONS_QUERY_KEY,
} from "@/lib/subscriptions";

export function useSubscriptionQueries() {
  const pendingQuery = useQuery({ queryKey: PENDING_TRANSACTIONS_QUERY_KEY, queryFn: fetchPendingTransactions });
  const recurringQuery = useQuery({ queryKey: RECURRING_TRANSACTIONS_QUERY_KEY, queryFn: fetchRecurringTransactions });

  return {
    pendingQuery,
    recurringQuery,
    pendingTransactions: pendingQuery.data ?? [],
    recurringTransactions: recurringQuery.data ?? [],
  };
}
