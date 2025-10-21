-- Add USD equivalence fields to transactions table if missing
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS amount_usd NUMERIC(18,2),
  ADD COLUMN IF NOT EXISTS exchange_rate_used NUMERIC(18,6);

-- Optional indexes for analytics/queries
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_currency ON public.transactions(currency);
