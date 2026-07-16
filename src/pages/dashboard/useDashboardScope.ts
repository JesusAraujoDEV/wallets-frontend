import { useState } from "react";

// Which account + category group the dashboard is currently scoped to.
export function useDashboardScope() {
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");
  const selectedGroupNumber = selectedGroupId === "all" ? null : Number(selectedGroupId);

  return { selectedAccount, setSelectedAccount, selectedGroupId, setSelectedGroupId, selectedGroupNumber };
}
