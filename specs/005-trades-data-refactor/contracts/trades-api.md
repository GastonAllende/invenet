# API Contract: Trades

**Branch**: `005-trades-data-refactor`  
**Date**: 2026-02-22  
**Base URL**: `/api/trades`  
**Authentication**: Bearer JWT required on all endpoints

---

## GET /api/trades

Returns all trades belonging to accounts owned by the authenticated user.

### Request

```
GET /api/trades
Authorization: Bearer <jwt>
```

No query parameters for the initial implementation (client-side pagination and sorting).

### Response — 200 OK

```json
{
  "trades": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "accountId": "7b4c1a2e-3d5f-4890-b1c2-9e8f7a6b5c4d",
      "strategyId": "1a2b3c4d-5e6f-7890-abcd-ef1234567890",
      "type": "BUY",
      "date": "2024-02-15T10:30:00",
      "symbol": "AAPL",
      "entryPrice": 175.5,
      "exitPrice": 180.0,
      "positionSize": 100,
      "investedAmount": 17550.0,
      "commission": 10.0,
      "profitLoss": 440.0,
      "status": "Win",
      "createdAt": "2024-02-15T10:35:00"
    }
  ],
  "total": 1
}
```

### Response — 200 OK (empty)

```json
{
  "trades": [],
  "total": 0
}
```

### Response — 401 Unauthorized

```json
{
  "message": "Authentication required"
}
```

### Field Reference

| Field            | Type                        | Nullable | Description                        |
| ---------------- | --------------------------- | -------- | ---------------------------------- |
| `id`             | `string` (UUID)             | No       | Unique trade identifier            |
| `accountId`      | `string` (UUID)             | No       | Owning account ID                  |
| `strategyId`     | `string` (UUID)             | Yes      | Optional linked strategy           |
| `type`           | `"BUY" \| "SELL"`           | No       | Trade direction                    |
| `date`           | `string` (ISO 8601)         | No       | Trade execution date               |
| `symbol`         | `string`                    | No       | Ticker symbol, max 20 chars        |
| `entryPrice`     | `number`                    | No       | Entry price per unit               |
| `exitPrice`      | `number`                    | Yes      | Exit price; null if status is Open |
| `positionSize`   | `number`                    | No       | Number of units / shares           |
| `investedAmount` | `number`                    | No       | Total capital deployed             |
| `commission`     | `number`                    | No       | Broker fee; 0 by default           |
| `profitLoss`     | `number`                    | No       | Realised P&L; 0 while open         |
| `status`         | `"Win" \| "Loss" \| "Open"` | No       | Trade outcome                      |
| `createdAt`      | `string` (ISO 8601)         | No       | Record creation timestamp          |

### Authorization Logic

The controller queries trades using the authenticated user's ID:

```csharp
var userId = GetCurrentUserId();  // from ClaimTypes.NameIdentifier

var userAccountIds = await _context.Accounts
    .Where(a => a.UserId == userId)
    .Select(a => a.Id)
    .ToListAsync();

var trades = await _context.Trades
    .Where(t => userAccountIds.Contains(t.AccountId))
    .OrderByDescending(t => t.Date)
    .Select(t => new TradeListItem(
        t.Id, t.AccountId, t.StrategyId,
        t.Type.ToString(), t.Date, t.Symbol,
        t.EntryPrice, t.ExitPrice,
        t.PositionSize, t.InvestedAmount,
        t.Commission, t.ProfitLoss,
        t.Status.ToString(), t.CreatedAt
    ))
    .ToListAsync();

return Ok(new ListTradesResponse(trades, trades.Count));
```

---

## Out of Scope (this feature)

The following endpoints are **not** part of this feature. They are placeholders for future work:

| Method   | Path               | Description        |
| -------- | ------------------ | ------------------ |
| `POST`   | `/api/trades`      | Create a new trade |
| `GET`    | `/api/trades/{id}` | Get a single trade |
| `PUT`    | `/api/trades/{id}` | Update a trade     |
| `DELETE` | `/api/trades/{id}` | Delete a trade     |
