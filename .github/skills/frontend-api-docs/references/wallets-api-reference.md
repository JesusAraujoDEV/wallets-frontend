# Wallets API Reference (Frontend Contract)

Version: 1.0.0 (OAS 3.0)
Server (development): `http://localhost:3001/api`
Frontend base URL source: `VITE_BACKEND_URL` from `.env`

This document is the canonical contract for frontend HTTP/API functions.

## Global contract rules

- Use exact path + method as listed here.
- For protected endpoints, send `Authorization: Bearer <JWT>`.
- Query params must keep exact names and formats.
- Dates:
  - `YYYY-MM-DD` for day-level params.
  - `YYYY-MM` for month-level params.
- CSV filters use comma-separated ids in a single string (`"1,2"`).
- `includeInStats` accepts: `0 | 1 | true | false` (string values in query).

---

## Stats

### GET /stats/net-cash-flow
Purpose: Net cash flow and savings rate by period.

Query:
- `from_date` (string, required) `YYYY-MM-DD`
- `to_date` (string, required) `YYYY-MM-DD`
- `time_unit` (string, optional): `month | week` (default: `month`)
- `accountId` (string, optional): csv ids, example `1,2`

200 response:
```json
{
  "summary": {
    "total_income": 2500,
    "total_expenses": 1800,
    "net_cash_flow": 700,
    "avg_savings_rate": 0.28
  },
  "time_series": [
    {
      "period": "2025-01",
      "income": 1000,
      "expenses": 700,
      "net_flow": 300,
      "savings_rate": 0.3
    }
  ]
}
```

### GET /stats/spending-heatmap
Purpose: Expense heatmap by category and weekday.

Query:
- `from_date` (string, required)
- `to_date` (string, required)
- `accountId` (string, optional): csv ids

200 response:
```json
{
  "categories": ["Comida", "Transporte", "Servicios"],
  "weekdays": ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"],
  "data_points": [
    { "category_idx": 0, "day_idx": 1, "amount": 35.5 }
  ],
  "summary": {
    "peak_category": "Comida",
    "peak_day": "Lunes"
  }
}
```

### GET /stats/income-heatmap
Purpose: Income heatmap by category and weekday.

Query:
- `from_date` (string, required)
- `to_date` (string, required)
- `accountId` (string, optional): csv ids

200 response:
```json
{
  "categories": ["Salario", "Bonos", "Intereses"],
  "weekdays": ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"],
  "data_points": [
    { "category_idx": 0, "day_idx": 5, "amount": 1500 }
  ],
  "summary": {
    "peak_category": "Salario",
    "peak_day": "Viernes"
  }
}
```

### GET /stats/expense-volatility
Purpose: Expense volatility (boxplot stats) for top categories.

Query:
- `from_date` (string, required)
- `to_date` (string, required)
- `top_n_categories` (integer, optional, default `5`)

200 response:
```json
{
  "categories_data": [
    {
      "category": "Comida",
      "count": 42,
      "q1": 8.5,
      "median": 12.2,
      "q3": 19.7,
      "min": 5,
      "max": 30,
      "outliers": [45.2]
    }
  ]
}
```

### GET /stats/income-volatility
Purpose: Income volatility (boxplot stats) for top categories.

Query:
- `from_date` (string, required)
- `to_date` (string, required)
- `top_n_categories` (integer, optional, default `5`)

200 response:
```json
{
  "categories_data": [
    {
      "category": "Salario",
      "count": 12,
      "q1": 900,
      "median": 1000,
      "q3": 1100,
      "min": 850,
      "max": 1200,
      "outliers": []
    }
  ]
}
```

### GET /stats/comparative-mom
Purpose: MTD vs previous MTD comparison by category and total.

Query:
- `date` (string, optional) reference date, default today

200 response:
```json
{
  "summary": {
    "current_period_name": "Marzo MTD (1-15)",
    "previous_period_name": "Febrero MTD (1-15)",
    "current_total": 520,
    "previous_total": 480,
    "total_delta_usd": 40,
    "total_delta_percent": 0.083
  },
  "categories_comparison": [
    {
      "category": "Comida",
      "current_amount": 200,
      "previous_amount": 180,
      "delta_percent": 0.111
    }
  ]
}
```

### GET /stats/comparative-mom-income
Purpose: Income MTD vs previous MTD comparison by category and total.

Query:
- `date` (string, optional)

200 response:
```json
{
  "summary": {
    "current_period_name": "Marzo MTD (1-15)",
    "previous_period_name": "Febrero MTD (1-15)",
    "current_total": 3200,
    "previous_total": 3000,
    "total_delta_usd": 200,
    "total_delta_percent": 0.0667
  },
  "categories_comparison": [
    {
      "category": "Salario",
      "current_amount": 3000,
      "previous_amount": 2800,
      "delta_percent": 0.0714
    }
  ]
}
```

### GET /stats/monthly-forecast
Purpose: Monthly spending forecast.

Query:
- `accountId` (string, optional): csv ids
- `date` (string, optional)
- `budget_total` (number, optional)

200 response:
```json
{
  "current_date": "2025-03-20",
  "days_in_month": 31,
  "days_elapsed": 20,
  "current_spending_mtd": 520,
  "avg_daily_spending": 26,
  "projected_total_spending": 806,
  "budget_total": 800,
  "projected_over_under": 6
}
```

---

## Status

### GET /status
Purpose: Service health check.

Query: none

200 response:
```json
{
  "ok": true,
  "info": {
    "name": "string",
    "version": "string",
    "env": "string",
    "uptimeSeconds": 0,
    "timestamp": "2026-03-13T20:32:29.798Z"
  },
  "components": {
    "db": {
      "ok": true,
      "latencyMs": 0,
      "error": "string"
    },
    "exchangeRateApi": {
      "ok": true,
      "latencyMs": 0,
      "error": "string"
    }
  },
  "totalLatencyMs": 0
}
```

---

## Summary

### GET /summary/balance
Purpose: Total balance in USDT (USD) and income/expense summary.

Query (all optional):
- `q` (string)
- `categoryId` (string): csv ids
- `accountId` (string): csv ids; if single id, response can be simplified for that account
- `date` (string $date)
- `dateFrom` (string $date, inclusive)
- `dateTo` (string $date, inclusive)
- `month` (string `YYYY-MM`)

200 response:
- Calculated balance object (shape can vary by filters).

### GET /summary/income
Purpose: Income summary by month or total.

Query:
- `from_month` (string, optional) `YYYY-MM`
- `to_month` (string, optional) `YYYY-MM` (inclusive; if omitted uses `from_month`)
- `includeInStats` (string, optional): `0 | 1 | true | false`
- `categoryId` (string, optional): csv ids
- `accountId` (string, optional): csv ids

200 response example:
```json
{
  "ok": true,
  "income_total": 1091.71,
  "income": [
    {
      "income_2025-09": 106.36,
      "income_2025-10": 985.35
    }
  ]
}
```

### GET /summary/expense
Purpose: Expense summary by month or total.

Query:
- `from_month` (string, optional) `YYYY-MM`
- `to_month` (string, optional) `YYYY-MM`
- `includeInStats` (string, optional): `0 | 1 | true | false`

200 response example:
```json
{
  "ok": true,
  "expense_total": 845.22,
  "expense": [
    {
      "expense_2025-09": 120.1,
      "expense_2025-10": 725.12
    }
  ]
}
```

---

## Transactions

### GET /transactions
Purpose: List transactions (optionally grouped by day).

Query:
- `grouped` (string, optional): `0 | 1` (`1` groups by day and paginates by day)
- `pageSize` (integer, optional; only when grouped=1; default `20`)
- `cursorDate` (string $date, optional; only when grouped=1; exclusive upper limit)
- `q` (string, optional)
- `type` (string, optional): `income | expense`
- `categoryId` (string, optional): csv ids
- `accountId` (string, optional): csv ids
- `date` (string $date, optional)
- `dateFrom` (string $date, optional)
- `dateTo` (string $date, optional)
- `month` (string, optional) `YYYY-MM`
- `includeInStats` (string, optional): `0 | 1 | true | false`

200 response:
- Non-grouped list or grouped response by day (`GroupedTransactionsResponse`).

### POST /transactions
Purpose: Create simple transaction.

Body (`application/json`):
```json
{
  "description": "string",
  "amount": 0,
  "currency": "VES",
  "date": "2026-03-13",
  "categoryId": 0,
  "accountId": 0,
  "commission": 0
}
```

201 response:
```json
{
  "ok": true,
  "newId": 0,
  "tx": {
    "id": 0,
    "description": "string",
    "amount": "string",
    "currency": "VES",
    "amountUsd": "string",
    "exchangeRateUsed": "string",
    "date": "2026-03-13",
    "categoryId": 0,
    "accountId": 0,
    "type": "ingreso"
  },
  "commissionTx": {
    "id": 0,
    "description": "string",
    "amount": "string",
    "currency": "VES",
    "amountUsd": "string",
    "exchangeRateUsed": "string",
    "date": "2026-03-13",
    "categoryId": 0,
    "accountId": 0,
    "type": "ingreso"
  }
}
```

Errors:
- `400` validation error
- `500` server error

### GET /transactions/transfer/export
Purpose: Export transfers by query (PDF/XLSX stream).

Query:
- `format` (string, required): `pdf | xlsx`
- `from_date` (string $date, optional)
- `to_date` (string $date, optional)
- `account_id` (integer, optional)
- `include_commission` (boolean, optional, default `false`)

200 response:
- Binary stream (`application/pdf` or XLSX).

Expected headers:
- `Content-Disposition`: `attachment; filename*=UTF-8''transfers_YYYY-MM-DD.pdf|.xlsx`
- `Cache-Control`: `no-store`

Errors:
- `400` invalid params
- `401` unauthorized
- `500` server error

### POST /transactions/transfer/export
Purpose: Export transfers (preferred for complex filters) using JSON body.

Body (`application/json`) example:
```json
{
  "format": "pdf",
  "from_date": "2025-01-01",
  "to_date": "2025-10-31",
  "include_commission": true
}
```

200 response:
- Binary stream with same header contract as GET variant.

Errors:
- `400` invalid params
- `401` unauthorized
- `500` server error

### POST /transactions/transfer
Purpose: Create transfer between accounts (2 tx + optional commission expense).

Body (`application/json`):
```json
{
  "fromAccountId": 1,
  "toAccountId": 2,
  "amount": 400,
  "commission": 10,
  "date": "2025-10-27",
  "concept": "Pago tarjeta"
}
```

201 response:
```json
{
  "ok": true,
  "transfer": {
    "outTx": {
      "id": 0,
      "description": "string",
      "amount": "string",
      "currency": "VES",
      "amountUsd": "string",
      "exchangeRateUsed": "string",
      "date": "2026-03-13",
      "categoryId": 0,
      "accountId": 0,
      "type": "ingreso"
    },
    "inTx": {
      "id": 0,
      "description": "string",
      "amount": "string",
      "currency": "VES",
      "amountUsd": "string",
      "exchangeRateUsed": "string",
      "date": "2026-03-13",
      "categoryId": 0,
      "accountId": 0,
      "type": "ingreso"
    },
    "commissionTx": {
      "id": 0,
      "description": "string",
      "amount": "string",
      "currency": "VES",
      "amountUsd": "string",
      "exchangeRateUsed": "string",
      "date": "2026-03-13",
      "categoryId": 0,
      "accountId": 0,
      "type": "ingreso"
    }
  }
}
```

Errors:
- `400` validation error (invalid accounts or different currencies, etc)
- `500` server error

---

## Accounts

### GET /accounts
Purpose: List authenticated user accounts.

Query: none

200 response:
```json
[
  {
    "id": 0,
    "name": "string",
    "balance": "string",
    "currency": "string",
    "userId": 0
  }
]
```

### POST /accounts
Purpose: Create account.

Body:
```json
{
  "name": "string",
  "balance": "string",
  "currency": "string"
}
```

201 response:
```json
{
  "id": 0,
  "name": "string",
  "balance": "string",
  "currency": "string",
  "userId": 0
}
```

### PATCH /accounts
Purpose: Partial account update.

Query:
- `id` (integer, required)

Body:
```json
{
  "name": "string",
  "balance": "string",
  "currency": "string"
}
```

200 response:
```json
{
  "id": 0,
  "name": "string",
  "balance": "string",
  "currency": "string",
  "userId": 0
}
```

### DELETE /accounts
Purpose: Delete account.

Query:
- `id` (integer, required)

200 response:
- Successful deletion (simple success payload).

---

## Auth

### POST /auth/login
Purpose: User login.

Body:
```json
{
  "username": "string",
  "password": "string"
}
```

200 response:
```json
{
  "ok": true,
  "token": "string",
  "user": {
    "id": 0,
    "username": "string",
    "email": "user@example.com",
    "name": "string"
  }
}
```

401 response example:
```json
{
  "ok": false,
  "statusCode": 400,
  "error": "BAD_REQUEST",
  "message": "chatId es requerido."
}
```

### POST /auth/register
Purpose: Register user + auto login.

Body:
```json
{
  "username": "string",
  "name": "string",
  "email": "user@example.com",
  "password": "string"
}
```

201 response:
```json
{
  "ok": true,
  "token": "string",
  "user": {
    "id": 0,
    "username": "string",
    "email": "user@example.com",
    "name": "string"
  }
}
```

409 response example:
```json
{
  "ok": false,
  "statusCode": 400,
  "error": "BAD_REQUEST",
  "message": "chatId es requerido."
}
```

### GET /auth/me
Purpose: Authenticated user info.

Query: none

200 response:
```json
{
  "ok": true,
  "user": {
    "id": 0,
    "username": "string",
    "email": "user@example.com",
    "name": "string"
  }
}
```

### PATCH /auth/me
Purpose: Update authenticated user profile fields.

Body:
```json
{
  "name": "string",
  "email": "user@example.com",
  "username": "string"
}
```

200 response:
```json
{
  "id": 0,
  "username": "string",
  "email": "user@example.com",
  "name": "string"
}
```

Errors:
- `400` invalid request payload
- `401` unauthorized
- `409` username/email conflict

### POST /auth/logout
Purpose: Symbolic logout.

Query: none

200 response:
- Logout success.

### POST /auth/forgot-password
Purpose: Request password recovery.

Headers:
- `Origin` (string, optional/conditional): frontend origin; backend validates against `FRONTEND_URLS` with safe fallback
- `Referer` (string, optional/conditional): fallback if `Origin` not available

Body:
```json
{
  "email": "user@example.com"
}
```

200 response:
```json
{
  "success": true,
  "message": "Operacion completada correctamente.",
  "data": {}
}
```

Errors:
- `400` invalid/unprocessable request
- `500` internal server error

### POST /auth/reset-password
Purpose: Reset password using token.

Body:
```json
{
  "token": "string",
  "newPassword": "string"
}
```

200 response:
```json
{
  "success": true,
  "message": "Operacion completada correctamente.",
  "data": {}
}
```

Errors:
- `400` invalid/expired token or invalid request
- `500` internal server error

---

## Categories

### GET /categories
Purpose: List user categories.

Query:
- `includeInStats` (string, optional): `true | false | 1 | 0`
- `type` (string, optional): `income | expense | ingreso | gasto`

200 response:
```json
[
  {
    "id": 0,
    "name": "string",
    "type": "ingreso",
    "includeInStats": true,
    "userId": 0
  }
]
```

### POST /categories
Purpose: Create category.

Body:
```json
{
  "name": "string",
  "type": "income",
  "includeInStats": true
}
```

201 response:
```json
{
  "id": 0,
  "name": "string",
  "type": "ingreso",
  "includeInStats": true,
  "userId": 0
}
```

### PATCH /categories
Purpose: Partial category update.

Query:
- `id` (integer, required)

Body:
```json
{
  "name": "string",
  "type": "income",
  "includeInStats": true
}
```

200 response:
- Updated category success.

### DELETE /categories
Purpose: Delete category.

Query:
- `id` (integer, required)

200 response:
- Successful deletion.

### POST /categories/include-in-stats/enable
Purpose: Enable include_in_stats for multiple categories.

Body:
```json
{
  "ids": [0]
}
```

200 response:
```json
{
  "ok": true,
  "rowCount": 0
}
```

### POST /categories/include-in-stats/disable
Purpose: Disable include_in_stats for multiple categories.

Body:
```json
{
  "ids": [0]
}
```

200 response:
```json
{
  "ok": true,
  "rowCount": 0
}
```

### GET /categories/include-in-stats/enabled
Purpose: List categories with include_in_stats=true.

200 response:
```json
[
  {
    "id": 0,
    "name": "string",
    "type": "ingreso",
    "includeInStats": true,
    "userId": 0
  }
]
```

### GET /categories/include-in-stats/disabled
Purpose: List categories with include_in_stats=false.

200 response:
```json
[
  {
    "id": 0,
    "name": "string",
    "type": "ingreso",
    "includeInStats": true,
    "userId": 0
  }
]
```

---

## Telegram

### POST /telegram/link
Purpose: Link Telegram chat session to authenticated user and store current JWT.

Body:
```json
{
  "chatId": 123456789,
  "username": "mi_usuario"
}
```

201 response:
```json
{
  "ok": true,
  "session": {
    "chatId": 0,
    "userId": 0,
    "username": "string",
    "jwtToken": "string",
    "createdAt": "2026-03-13T20:32:29.894Z",
    "updatedAt": "2026-03-13T20:32:29.894Z"
  }
}
```

Errors:
- `400` invalid request
- `401` unauthorized

### GET /telegram/exists
Purpose: Check if session exists by chatId + username.

Query:
- `chatId` (integer int64, required)
- `username` (string, required)

200 response:
```json
{
  "ok": true,
  "exists": true
}
```

400 response: invalid request.

### GET /telegram/session
Purpose: Get session by chatId.

Query:
- `chatId` (integer int64, required)

200 response:
```json
{
  "ok": true,
  "session": {
    "chatId": 0,
    "userId": 0,
    "username": "string",
    "jwtToken": "string",
    "createdAt": "2026-03-13T20:32:29.903Z",
    "updatedAt": "2026-03-13T20:32:29.903Z"
  }
}
```

Errors:
- `400` invalid request
- `404` not found

### DELETE /telegram/session
Purpose: Delete session by chatId.

Query:
- `chatId` (integer int64, required)

200 response:
```json
{
  "ok": true
}
```

Errors:
- `400` invalid request
- `404` not found

---

## Schema names exposed by API docs

- `Account`
- `AccountCreate`
- `AccountUpdate`
- `ErrorResponse`
- `LoginRequest`
- `RegisterRequest`
- `User`
- `LoginResponse`
- `RegisterResponse`
- `ForgotPasswordRequest`
- `ResetPasswordRequest`
- `GenericSuccessResponse`
- `Category`
- `CategoryCreate`
- `CategoryUpdate`
- `CategoryIdsPayload`
- `Transaction`
- `GroupedTransactionsResponse`
- `TransferRequest`
- `TransferResponse`
- `TelegramLinkRequest`
- `TelegramLinkResponse`
- `TelegramExistsResponse`
- `TelegramDeleteResponse`

---

## Frontend implementation guardrail

Before implementing any frontend network function:
1. Find endpoint here.
2. Copy exact request contract (query/body/headers).
3. Copy exact success shape and expected errors.
4. Only then write TypeScript types and HTTP function.

If not found here, stop and ask for contract confirmation.
