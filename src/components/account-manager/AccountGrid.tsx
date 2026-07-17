import type { Account } from "@/lib/types";
import { AccountCard } from "./AccountCard";

interface AccountGridProps {
  accounts: Account[];
  vesPerUsd?: number;
  deletingId: string | null;
  onEdit: (account: Account) => void;
  onRequestDelete: (accountId: string) => void;
}

export const AccountGrid = ({ accounts, vesPerUsd, deletingId, onEdit, onRequestDelete }: AccountGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          vesPerUsd={vesPerUsd}
          isDeleting={deletingId === account.id}
          onEdit={onEdit}
          onRequestDelete={onRequestDelete}
        />
      ))}
    </div>
  );
};
