import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs from "dayjs";
import { Calendar as CalendarIcon, PlusCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AccountOption } from "./AccountOption";
import { TransferArbitrageSummary } from "./TransferArbitrageSummary";
import { useTransferForm } from "./useTransferForm";
import type { Account } from "@/lib/types";
import type { ExchangeRate } from "@/lib/rates";

export function TransferForm({ accounts, rate, onSubmitted }: {
  accounts: Account[];
  rate: ExchangeRate | null | undefined;
  onSubmitted?: () => void;
}) {
  const f = useTransferForm({ accounts, onSubmitted });

  return (
    <form onSubmit={f.handleTransferSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fromAccount">From account</Label>
          <Select value={f.fromAccount} onValueChange={f.setFromAccount}>
            <SelectTrigger id="fromAccount"><SelectValue placeholder="Select origin account" /></SelectTrigger>
            <SelectContent>
              {accounts.map((acc) => (
                <SelectItem key={acc.id} value={acc.id}><AccountOption account={acc} rate={rate} /></SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="toAccount">To account</Label>
          <Select value={f.toAccount} onValueChange={f.setToAccount}>
            <SelectTrigger id="toAccount"><SelectValue placeholder="Select destination account" /></SelectTrigger>
            <SelectContent>
              {accounts.map((acc) => (
                <SelectItem key={acc.id} value={acc.id}><AccountOption account={acc} rate={rate} /></SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="transferAmount">Amount</Label>
          <Input id="transferAmount" type="number" step="0.01" placeholder="0.00" value={f.transferAmount} onChange={(e) => f.setTransferAmount(e.target.value)} required />
        </div>
        {f.hasDifferentCurrencies && (
          <div className="space-y-2">
            <Label htmlFor="destinationAmount">Destination amount</Label>
            <Input
              id="destinationAmount" type="number" step="0.01" placeholder="0.00" value={f.destinationAmount}
              onChange={(e) => { f.setDestinationEdited(true); f.setDestinationAmount(e.target.value); }}
              required
            />
            <p className="text-xs text-muted-foreground">
              {f.bcvLoading ? "Loading BCV rate..." : f.bcvSourceDate ? `BCV reference date: ${f.bcvSourceDate}` : "BCV reference unavailable for selected date."}
            </p>
            {Number(f.transferAmount) > 0 && Number(f.destinationAmount) > 0 ? (
              <p className="text-xs text-muted-foreground">Tasa aplicada: {(Number(f.destinationAmount) / Number(f.transferAmount)).toFixed(6)}</p>
            ) : null}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="commission">Commission (optional)</Label>
          <Input id="commission" type="number" step="0.01" placeholder="0.00" value={f.commission} onChange={(e) => f.setCommission(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left font-normal")} type="button">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {f.transferDate ? dayjs(f.transferDate).format("YYYY-MM-DD") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="start">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar value={f.transferDate ? dayjs(f.transferDate) : null} onChange={(d: any) => { if (d) f.setTransferDate(d.format("YYYY-MM-DD")); }} />
              </LocalizationProvider>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="concept">Concept (optional)</Label>
        <Input id="concept" type="text" placeholder="Add a note..." value={f.concept} onChange={(e) => f.setConcept(e.target.value)} />
      </div>
      {f.showArbitrageSummary && f.baseBcvAmount != null && f.appliedRate != null && f.gainOrLoss != null && f.gainOrLossUsdApprox != null ? (
        <TransferArbitrageSummary
          bcvOfficialRate={f.bcvOfficialRate} appliedRate={f.appliedRate} baseBcvAmount={f.baseBcvAmount}
          gainOrLoss={f.gainOrLoss} gainOrLossUsdApprox={f.gainOrLossUsdApprox}
        />
      ) : null}
      <div className="grid grid-cols-1 gap-3">
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={f.submittingTransfer} aria-busy={f.submittingTransfer}>
          {f.submittingTransfer ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</>) : (<><PlusCircle className="w-4 h-4 mr-2" />Create Transfer</>)}
        </Button>
      </div>
    </form>
  );
}
