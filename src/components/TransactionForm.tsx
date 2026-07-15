import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountsStore, CategoriesStore, onDataChange } from "@/lib/storage";
import type { Account, Category } from "@/lib/types";
import { useCurrentExchangeRate } from "@/lib/rates";
import { SingleTransactionForm } from "@/components/transaction-form/SingleTransactionForm";
import { TransferForm } from "@/components/transaction-form/TransferForm";

export const TransactionForm = ({ asModalContent = false, onSubmitted }: { asModalContent?: boolean; onSubmitted?: () => void }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { data: rate } = useCurrentExchangeRate();

  useEffect(() => {
    const load = () => {
      setAccounts(AccountsStore.all());
      setCategories(CategoriesStore.all());
    };
    load();
    const off = onDataChange(load);
    return off;
  }, []);

  const content = (
    <Tabs defaultValue="single" className="w-full">
      <TabsList className="mb-4 grid grid-cols-2 w-full">
        <TabsTrigger value="single">Income / Expense</TabsTrigger>
        <TabsTrigger value="transfer">Transfer</TabsTrigger>
      </TabsList>
      <TabsContent value="single">
        <SingleTransactionForm accounts={accounts} categories={categories} rate={rate} onSubmitted={onSubmitted} />
      </TabsContent>
      <TabsContent value="transfer">
        <TransferForm accounts={accounts} rate={rate} onSubmitted={onSubmitted} />
      </TabsContent>
    </Tabs>
  );

  if (asModalContent) {
    return content;
  }

  return (
    <Card className="p-6 shadow-md border-0">
      <h3 className="text-xl font-semibold text-foreground mb-6">Add Transaction</h3>
      {content}
    </Card>
  );
};
