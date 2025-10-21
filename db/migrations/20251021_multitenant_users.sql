-- Multi-tenant: add user scoping to accounts, categories, transactions

-- 1) Add user_id columns (nullable for backfill step)
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS user_id integer;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS user_id integer;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS user_id integer;

-- 2) Foreign keys to public.users(id)
DO $$ BEGIN
  ALTER TABLE public.accounts ADD CONSTRAINT accounts_user_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.categories ADD CONSTRAINT categories_user_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.transactions ADD CONSTRAINT transactions_user_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3) Helpful indexes
CREATE INDEX IF NOT EXISTS accounts_user_idx ON public.accounts (user_id);
CREATE INDEX IF NOT EXISTS categories_user_idx ON public.categories (user_id);
CREATE INDEX IF NOT EXISTS transactions_user_idx ON public.transactions (user_id);
CREATE INDEX IF NOT EXISTS transactions_user_date_idx ON public.transactions (user_id, date DESC);

-- 4) Category uniqueness per user (case-insensitive by name)
ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_name_key;
CREATE UNIQUE INDEX IF NOT EXISTS categories_user_name_key ON public.categories (user_id, lower(name));

-- 5) After backfilling user_id for existing rows, you can enforce NOT NULL:
-- ALTER TABLE public.accounts ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE public.categories ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE public.transactions ALTER COLUMN user_id SET NOT NULL;

-- Backfill example (replace 123 with the actual user id to own existing data)
-- UPDATE public.accounts SET user_id = 123 WHERE user_id IS NULL;
-- UPDATE public.categories SET user_id = 123 WHERE user_id IS NULL;
-- UPDATE public.transactions SET user_id = 123 WHERE user_id IS NULL;
