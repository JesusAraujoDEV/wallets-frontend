# Serverless Neon setup

1. Install driver
   npm install @neondatabase/serverless

1. Env var
   Set DATABASE_URL in Vercel/Neon. For local dev with Vite + Vercel dev, create .env.local with DATABASE_URL.

1. Schema (created on first API call as well)

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('USD','EUR','VES')),
  balance DOUBLE PRECISION NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income','expense')),
  color TEXT NOT NULL,
  color_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income','expense'))
);

1. Dev run
   Use `vercel dev` to run edge/serverless functions locally so /api routes work, then vite can proxy via the same port.
