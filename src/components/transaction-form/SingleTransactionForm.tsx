import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerField } from "@/components/DatePickerField";
import { PlusCircle, Loader2 } from "lucide-react";
import { CategorySelector } from "@/components/CategorySelector";
import { AccountOption } from "./AccountOption";
import { useSingleTransactionForm } from "./useSingleTransactionForm";
import type { Account, Category } from "@/lib/types";
import type { ExchangeRate } from "@/lib/rates";

export function SingleTransactionForm({ accounts, categories, rate, onSubmitted }: {
  accounts: Account[];
  categories: Category[];
  rate: ExchangeRate | null | undefined;
  onSubmitted?: () => void;
}) {
  const f = useSingleTransactionForm({ accounts, categories, onSubmitted });

  return (
    <form onSubmit={f.handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="account">Account</Label>
        <Select value={f.account} onValueChange={f.setAccount}>
          <SelectTrigger id="account"><SelectValue placeholder="Select account" /></SelectTrigger>
          <SelectContent>
            {accounts.map((acc) => (
              <SelectItem key={acc.id} value={acc.id}><AccountOption account={acc} rate={rate} /></SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <div className="flex min-h-10 items-end"><Label htmlFor="amount">Amount</Label></div>
          <Input id="amount" type="number" step="0.01" placeholder="0.00" value={f.amount} onChange={(e) => f.setAmount(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <div className="flex min-h-10 items-end"><Label htmlFor="singleCommission">Commission (optional)</Label></div>
          <Input id="singleCommission" type="number" step="0.01" placeholder="0.00" value={f.singleCommission} onChange={(e) => f.setSingleCommission(e.target.value)} />
        </div>
        <div className="space-y-2">
          <div className="flex min-h-10 items-end"><Label htmlFor="date">Date</Label></div>
          <DatePickerField id="date" value={f.date} onChange={f.setDate} />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium leading-none">Category</Label>
        <CategorySelector
          value={f.category}
          onChange={(id) => {
            const cat = categories.find((c) => c.id === id);
            if (cat) f.setType(cat.type);
            f.setCategory(id);
          }}
          categories={categories}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Input id="description" type="text" placeholder="Add a note..." value={f.description} onChange={(e) => f.setDescription(e.target.value)} />
      </div>
      <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={f.submitting} aria-busy={f.submitting}>
        {f.submitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding...</>) : (<><PlusCircle className="w-4 h-4 mr-2" />Add Transaction</>)}
      </Button>
    </form>
  );
}
