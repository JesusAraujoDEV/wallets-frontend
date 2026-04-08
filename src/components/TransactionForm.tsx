import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, PlusCircle, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AccountsStore, CategoriesStore, TransactionsStore, TransfersStore, newId, onDataChange } from "@/lib/storage";
import type { Account, Category } from "@/lib/types";
import { getRateByDate, useVESExchangeRate } from "@/lib/rates";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategorySelector } from "@/components/CategorySelector";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const TransactionForm = ({ asModalContent = false, onSubmitted }: { asModalContent?: boolean; onSubmitted?: () => void }) => {
  const [account, setAccount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [singleCommission, setSingleCommission] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { rate } = useVESExchangeRate();
  const [submitting, setSubmitting] = useState(false);
  // Transfer state
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [commission, setCommission] = useState("");
  const [destinationAmount, setDestinationAmount] = useState("");
  const [destinationEdited, setDestinationEdited] = useState(false);
  const [transferDate, setTransferDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [concept, setConcept] = useState("");
  const [submittingTransfer, setSubmittingTransfer] = useState(false);
  const [bcvLoading, setBcvLoading] = useState(false);
  const [bcvOfficialRate, setBcvOfficialRate] = useState<number | null>(null);
  const [bcvSourceDate, setBcvSourceDate] = useState<string | null>(null);
  const filteredCategories = categories.filter((c) => c.type === type);
  const fromAccountData = accounts.find((a) => a.id === fromAccount);
  const toAccountData = accounts.find((a) => a.id === toAccount);
  const hasDifferentCurrencies = !!fromAccountData && !!toAccountData && fromAccountData.currency !== toAccountData.currency;
  const isUsdVesPair = !!fromAccountData && !!toAccountData && (
    (fromAccountData.currency === "USD" && toAccountData.currency === "VES") ||
    (fromAccountData.currency === "VES" && toAccountData.currency === "USD")
  );

  useEffect(() => {
    // When account pair or transfer date changes, re-seed destination value from BCV.
    setDestinationEdited(false);
  }, [fromAccount, toAccount, transferDate]);

  useEffect(() => {
    let cancelled = false;

    const loadBcvRate = async () => {
      if (!hasDifferentCurrencies) {
        setBcvOfficialRate(null);
        setDestinationAmount("");
        setBcvSourceDate(null);
        return;
      }

      if (!isUsdVesPair) {
        setBcvOfficialRate(null);
        setDestinationAmount("");
        setBcvSourceDate(null);
        return;
      }

      try {
        setBcvLoading(true);
        const rate = await getRateByDate(transferDate);
        if (cancelled) return;
        if (!rate || !isFinite(rate.vesPerUsd) || rate.vesPerUsd <= 0) {
          setBcvOfficialRate(null);
          setBcvSourceDate(null);
          toast({
            title: "BCV unavailable",
            description: "No BCV rate available for the selected date.",
            variant: "destructive",
          });
          return;
        }

        setBcvOfficialRate(rate.vesPerUsd);
        setBcvSourceDate(rate.sourceDate);
      } finally {
        if (!cancelled) {
          setBcvLoading(false);
        }
      }
    };

    void loadBcvRate();

    return () => {
      cancelled = true;
    };
  }, [hasDifferentCurrencies, isUsdVesPair, transferDate]);

  useEffect(() => {
    if (!hasDifferentCurrencies || !isUsdVesPair) return;
    const numericAmount = Number(transferAmount);
    if (!isFinite(numericAmount) || numericAmount <= 0 || !bcvOfficialRate || bcvOfficialRate <= 0) {
      if (!destinationEdited) {
        setDestinationAmount("");
      }
      return;
    }

    if (destinationEdited) {
      return;
    }

    const calculated = fromAccountData?.currency === "USD"
      ? numericAmount * bcvOfficialRate
      : numericAmount / bcvOfficialRate;

    setDestinationAmount(calculated.toFixed(2));
  }, [hasDifferentCurrencies, isUsdVesPair, transferAmount, destinationEdited, fromAccountData?.currency, bcvOfficialRate]);

  const parsedTransferAmount = Number(transferAmount);
  const parsedDestinationAmount = Number(destinationAmount);
  const showArbitrageSummary =
    hasDifferentCurrencies &&
    isUsdVesPair &&
    fromAccountData?.currency === "USD" &&
    toAccountData?.currency === "VES" &&
    isFinite(parsedTransferAmount) &&
    parsedTransferAmount > 0 &&
    isFinite(parsedDestinationAmount) &&
    parsedDestinationAmount > 0 &&
    !!bcvOfficialRate &&
    bcvOfficialRate > 0;

  const baseBcvAmount = showArbitrageSummary ? parsedTransferAmount * (bcvOfficialRate ?? 0) : null;
  const appliedRate = showArbitrageSummary ? parsedDestinationAmount / parsedTransferAmount : null;
  const gainOrLoss = showArbitrageSummary && baseBcvAmount != null ? parsedDestinationAmount - baseBcvAmount : null;
  const gainOrLossUsdApprox = showArbitrageSummary && gainOrLoss != null && bcvOfficialRate ? gainOrLoss / bcvOfficialRate : null;

  useEffect(() => {
    const load = () => {
      setAccounts(AccountsStore.all());
      setCategories(CategoriesStore.all());
    };
    load();
    const off = onDataChange(load);
    return off;
  }, []);

  // Ensure selected category matches the chosen type
  useEffect(() => {
    if (category && !filteredCategories.some((c) => c.id === category)) {
      setCategory("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account || !amount || !category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields, including the account.",
        variant: "destructive",
      });
      return;
    }

    const selectedAccount = accounts.find(acc => acc.id === account);
    const selectedCategory = categories.find(cat => cat.id === category);

    try {
      setSubmitting(true);
      // Persist transaction
      await TransactionsStore.add({
        id: newId(),
        date: date || new Date().toISOString().slice(0, 10),
        description: description || (type === "income" ? "Income" : "Expense"),
        categoryId: selectedCategory?.id || "",
        accountId: selectedAccount?.id || "",
        amount: parseFloat(amount),
        type,
      }, { commission: singleCommission ? parseFloat(singleCommission) : undefined });
      toast({
        title: "Transaction Added",
        description: `${type === "income" ? "Income" : "Expense"} of $${amount}${singleCommission ? ` (+$${Number(singleCommission).toFixed(2)} commission)` : ""} recorded to ${selectedAccount?.name}.`,
      });

      // Reset form
      setAccount("");
      setAmount("");
      setSingleCommission("");
      setCategory("");
      setDescription("");
      setDate(new Date().toISOString().slice(0, 10));
      onSubmitted?.();
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAccount || !toAccount || !transferAmount) {
      toast({ title: "Missing Information", description: "Please choose both accounts and an amount.", variant: "destructive" });
      return;
    }
    if (fromAccount === toAccount) {
      toast({ title: "Invalid Accounts", description: "Origin and destination accounts must be different.", variant: "destructive" });
      return;
    }
    const from = fromAccountData;
    const to = toAccountData;
    if (!from || !to) return;

    if (from.currency !== to.currency && !isUsdVesPair) {
      toast({
        title: "Unsupported currency pair",
        description: "This transfer currently supports only USD and VES between different currencies.",
        variant: "destructive"
      });
      return;
    }

    if (hasDifferentCurrencies && !destinationAmount) {
      toast({
        title: "Missing destination amount",
        description: "Please enter the amount received in the destination account.",
        variant: "destructive"
      });
      return;
    }

    const parsedAmount = Number(transferAmount);
    const parsedDestinationAmount = hasDifferentCurrencies
      ? Number(destinationAmount)
      : Number(transferAmount);
    if (!isFinite(parsedAmount) || parsedAmount <= 0 || !isFinite(parsedDestinationAmount) || parsedDestinationAmount <= 0) {
      toast({ title: "Invalid amount", description: "Amounts must be greater than zero.", variant: "destructive" });
      return;
    }

    try {
      setSubmittingTransfer(true);
      await TransfersStore.create({
        fromAccountId: fromAccount,
        toAccountId: toAccount,
        amount: parsedAmount,
        destinationAmount: parsedDestinationAmount,
        commission: commission ? parseFloat(commission) : undefined,
        date: transferDate || new Date().toISOString().slice(0, 10),
        concept: concept || undefined,
      });
      toast({ title: "Transfer created", description: `Moved ${from.currency === "USD" ? "$" : from.currency === "EUR" ? "€" : ""}${transferAmount} from ${from.name} to ${to.name}.` });
      // Reset transfer form
      setFromAccount("");
      setToAccount("");
      setTransferAmount("");
      setDestinationAmount("");
      setDestinationEdited(false);
      setCommission("");
      setTransferDate(new Date().toISOString().slice(0, 10));
      setConcept("");
      setBcvSourceDate(null);
      onSubmitted?.();
    } finally {
      setSubmittingTransfer(false);
    }
  };

  const singleFormEl = (
    <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="account">Account</Label>
          <Select value={account} onValueChange={setAccount}>
            <SelectTrigger id="account">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((acc) => (
                <SelectItem key={acc.id} value={acc.id}>
                  <div className="flex items-center justify-between gap-3 w-full">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{acc.name}</span>
                      <span className="text-xs text-muted-foreground">({acc.currency})</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-foreground/80">
                        {acc.currency === "USD" && "$"}
                        {acc.currency === "EUR" && "€"}
                        {acc.currency === "VES" && "Bs."}
                        {acc.balance.toFixed(2)}
                      </div>
                      {acc.currency === "VES" && rate?.vesPerUsd ? (
                        <div className="text-[10px] text-muted-foreground">$
                          {(acc.balance / rate.vesPerUsd).toFixed(2)} USD
                        </div>
                      ) : null}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="singleCommission">Commission (optional)</Label>
            <Input
              id="singleCommission"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={singleCommission}
              onChange={(e) => setSingleCommission(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                  )}
                  type="button"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? dayjs(date).format('YYYY-MM-DD') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="start">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateCalendar
                    value={date ? dayjs(date) : null}
                    onChange={(d:any) => {
                      if (d) {
                        const iso = d.format('YYYY-MM-DD');
                        setDate(iso);
                      }
                    }}
                  />
                </LocalizationProvider>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium leading-none">Category</Label>
          <CategorySelector
            value={category}
            onChange={(id) => {
              const cat = categories.find((c) => c.id === id);
              if (cat) setType(cat.type);
              setCategory(id);
            }}
            categories={categories}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Input
            id="description"
            type="text"
            placeholder="Add a note..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={submitting} aria-busy={submitting}>
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Transaction
            </>
          )}
        </Button>
      </form>
  );

  const transferFormEl = (
    <form onSubmit={handleTransferSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fromAccount">From account</Label>
          <Select value={fromAccount} onValueChange={setFromAccount}>
            <SelectTrigger id="fromAccount">
              <SelectValue placeholder="Select origin account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((acc) => (
                <SelectItem key={acc.id} value={acc.id}>
                  <div className="flex items-center justify-between gap-3 w-full">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{acc.name}</span>
                      <span className="text-xs text-muted-foreground">({acc.currency})</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-foreground/80">
                        {acc.currency === "USD" && "$"}
                        {acc.currency === "EUR" && "€"}
                        {acc.currency === "VES" && "Bs."}
                        {acc.balance.toFixed(2)}
                      </div>
                      {acc.currency === "VES" && rate?.vesPerUsd ? (
                        <div className="text-[10px] text-muted-foreground">$
                          {(acc.balance / rate.vesPerUsd).toFixed(2)} USD
                        </div>
                      ) : null}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="toAccount">To account</Label>
          <Select value={toAccount} onValueChange={setToAccount}>
            <SelectTrigger id="toAccount">
              <SelectValue placeholder="Select destination account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((acc) => (
                <SelectItem key={acc.id} value={acc.id}>
                  <div className="flex items-center justify-between gap-3 w-full">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{acc.name}</span>
                      <span className="text-xs text-muted-foreground">({acc.currency})</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-foreground/80">
                        {acc.currency === "USD" && "$"}
                        {acc.currency === "EUR" && "€"}
                        {acc.currency === "VES" && "Bs."}
                        {acc.balance.toFixed(2)}
                      </div>
                      {acc.currency === "VES" && rate?.vesPerUsd ? (
                        <div className="text-[10px] text-muted-foreground">$
                          {(acc.balance / rate.vesPerUsd).toFixed(2)} USD
                        </div>
                      ) : null}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="transferAmount">Amount</Label>
          <Input
            id="transferAmount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            required
          />
        </div>
        {hasDifferentCurrencies && (
          <div className="space-y-2">
            <Label htmlFor="destinationAmount">Destination amount</Label>
            <Input
              id="destinationAmount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={destinationAmount}
              onChange={(e) => {
                setDestinationEdited(true);
                setDestinationAmount(e.target.value);
              }}
              required
            />
            <p className="text-xs text-muted-foreground">
              {bcvLoading
                ? "Loading BCV rate..."
                : bcvSourceDate
                  ? `BCV reference date: ${bcvSourceDate}`
                  : "BCV reference unavailable for selected date."}
            </p>
            {Number(transferAmount) > 0 && Number(destinationAmount) > 0 ? (
              <p className="text-xs text-muted-foreground">
                Tasa aplicada: {(Number(destinationAmount) / Number(transferAmount)).toFixed(6)}
              </p>
            ) : null}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="commission">Commission (optional)</Label>
          <Input
            id="commission"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={commission}
            onChange={(e) => setCommission(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                )}
                type="button"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {transferDate ? dayjs(transferDate).format('YYYY-MM-DD') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="start">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                  value={transferDate ? dayjs(transferDate) : null}
                  onChange={(d:any) => {
                    if (d) {
                      const iso = d.format('YYYY-MM-DD');
                      setTransferDate(iso);
                    }
                  }}
                />
              </LocalizationProvider>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="concept">Concept (optional)</Label>
        <Input
          id="concept"
          type="text"
          placeholder="Add a note..."
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
        />
      </div>
      {showArbitrageSummary && baseBcvAmount != null && appliedRate != null && gainOrLoss != null && gainOrLossUsdApprox != null ? (
        <Alert className="border-primary/30 bg-primary/5">
          <AlertTitle>Resumen de la Jugada</AlertTitle>
          <AlertDescription className="space-y-1 text-sm break-words">
            <p>Tasa oficial BCV: {bcvOfficialRate?.toFixed(4)}</p>
            <p>Tasa tuya aplicada: {appliedRate.toFixed(6)}</p>
            <p>Monto Base BCV: {baseBcvAmount.toFixed(2)} VES</p>
            {gainOrLoss > 0 ? (
              <p className="font-medium text-emerald-600">¡Farmeando Aura! Ganancia detectada: +{gainOrLoss.toFixed(2)} VES (Aprox +{gainOrLossUsdApprox.toFixed(2)} USD)</p>
            ) : gainOrLoss < 0 ? (
              <p className="font-medium text-red-600">Pérdida cambiaria: {gainOrLoss.toFixed(2)} VES</p>
            ) : (
              <p className="font-medium text-muted-foreground">Sin diferencia cambiaria: 0.00 VES</p>
            )}
          </AlertDescription>
        </Alert>
      ) : null}
      <div className="grid grid-cols-1 gap-3">
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={submittingTransfer} aria-busy={submittingTransfer}>
          {submittingTransfer ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Transfer
            </>
          )}
        </Button>
      </div>
    </form>
  );

  const content = (
    <Tabs defaultValue="single" className="w-full">
      <TabsList className="mb-4 grid grid-cols-2 w-full">
        <TabsTrigger value="single">Income / Expense</TabsTrigger>
        <TabsTrigger value="transfer">Transfer</TabsTrigger>
      </TabsList>
      <TabsContent value="single">{singleFormEl}</TabsContent>
      <TabsContent value="transfer">{transferFormEl}</TabsContent>
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
