# Quickstart & Verification: Trade CRUD

**Feature**: 006-trade-crud  
**Branch**: `006-trade-crud`

---

## Prerequisites

1. PostgreSQL is running and the `invenet` database is accessible.
2. Feature 005 migration has been applied (`20260223084555_AddTradeFields`).
3. At least one Account exists for the test user.

---

## Start Services

```bash
# Terminal 1 — Backend
cd apps/api/Invenet.Api
dotnet watch run

# Terminal 2 — Frontend
npx nx serve invenet
```

Backend available at `https://localhost:5001` (or configured port).  
Frontend available at `http://localhost:4200`.

---

## Verification Checklist

### US1 — Create a Trade

- [ ] Log in and navigate to **Trade History** (`/trades`).
- [ ] The "New Trade" button is visible in the page header.
- [ ] Click "New Trade" → a modal dialog opens with an **empty** form.
- [ ] The **Account** selector lists only accounts belonging to the logged-in user.
- [ ] The **Strategy** selector lists only active strategies (no deleted ones); selecting none is valid.
- [ ] The **Type** selector shows "BUY" and "SELL".
- [ ] The **Status** selector shows "Win", "Loss", "Open"; defaults to "Open".
- [ ] Fill required fields (Symbol, Type, Date, Entry Price, Position Size, Account).
- [ ] **Invested Amount** auto-updates = Position Size × Entry Price as you type.
- [ ] Fill **Exit Price** → **Profit/Loss** auto-updates = (Exit − Entry) × Size − Commission.
- [ ] Clear Exit Price → **Profit/Loss** resets to 0.
- [ ] Click **Save** → dialog closes, success toast shown, new trade appears **at the top** of the list.
- [ ] The new trade row shows correct values for all 10 columns.
- [ ] Leave Symbol blank and click Save → inline validation error shown; dialog stays open.
- [ ] Click **Cancel** (or ✕) without saving → dialog closes; list unchanged.
- [ ] _(Optional)_ Stop the backend, try to save → error toast shown; dialog remains open with form data intact.

---

### US2 — Edit a Trade

- [ ] Click the **Edit** (pencil) button on any trade row.
- [ ] Modal opens with **all fields pre-populated** with the trade's current values.
- [ ] **Invested Amount** and **Profit/Loss** show the correct pre-calculated values.
- [ ] Modify the Symbol → click **Save** → dialog closes, success toast shown, updated value visible in list.
- [ ] Edit a trade → change Exit Price → verify P&L auto-calculates before saving.
- [ ] Edit a trade → click Cancel → original values unchanged in the list.
- [ ] _(Optional)_ Stop backend, click Save → error toast; dialog stays open.

---

### US3 — Delete a Trade

- [ ] Click the **Delete** (trash) button on any trade row.
- [ ] A **confirmation dialog** appears: "Are you sure you want to delete this trade? This action cannot be undone."
- [ ] Click **Cancel** in the confirmation → dialog closes; trade remains in the list.
- [ ] Click **Delete** (or Confirm) in the confirmation → trade is **removed from the list** immediately; success toast shown.
- [ ] If the list had only one trade and you delete it → the **empty-state message** is displayed.

---

### Cross-cutting

- [ ] Opening and closing the dialog is visually instant (<200ms).
- [ ] While a save operation is in progress, the Save button is **disabled/loading** (prevents double-click).
- [ ] No browser console errors during any of the above flows.
- [ ] Run lint: `npx nx lint trades && npx nx lint invenet` — no errors.
- [ ] Run build: `npx nx build invenet --configuration=production` — succeeds.

---

## API Smoke Test (optional – with curl or Swagger)

```bash
# Get token first (replace credentials)
TOKEN=$(curl -s -X POST https://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Password1!"}' \
  | jq -r '.accessToken')

# GET trades list
curl -s https://localhost:5001/api/trades \
  -H "Authorization: Bearer $TOKEN" | jq '.total'

# POST create trade (replace accountId with a real one)
curl -s -X POST https://localhost:5001/api/trades \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "<YOUR_ACCOUNT_ID>",
    "type": "BUY",
    "date": "2026-02-23T10:00:00Z",
    "symbol": "AAPL",
    "entryPrice": 175.50,
    "positionSize": 10,
    "investedAmount": 1755.00,
    "commission": 5.00,
    "profitLoss": 0,
    "status": "Open"
  }' | jq '{id, symbol, status}'

# PUT update (replace <TRADE_ID>)
curl -s -X PUT https://localhost:5001/api/trades/<TRADE_ID> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "BUY",
    "date": "2026-02-23T10:00:00Z",
    "symbol": "AAPL",
    "entryPrice": 175.50,
    "exitPrice": 180.00,
    "positionSize": 10,
    "investedAmount": 1755.00,
    "commission": 5.00,
    "profitLoss": 40.00,
    "status": "Win"
  }' | jq '{id, status, profitLoss}'

# DELETE trade
curl -s -X DELETE https://localhost:5001/api/trades/<TRADE_ID> \
  -H "Authorization: Bearer $TOKEN" -o /dev/null -w "%{http_code}"
# Expected: 204
```
