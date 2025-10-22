-- Allow same category name per user across different types (income/expense)
-- Previously: UNIQUE (user_id, lower(name)) blocked creating an 'income' category with the same name as an existing 'expense' category.

-- 1) Drop the old unique index (safe if it doesn't exist)
DROP INDEX IF EXISTS categories_user_name_key;

-- 2) Create the new unique index including type
-- Note: "type" column stores 'ingreso' | 'gasto'
CREATE UNIQUE INDEX IF NOT EXISTS categories_user_type_name_key
ON public.categories (user_id, "type", lower(name));
