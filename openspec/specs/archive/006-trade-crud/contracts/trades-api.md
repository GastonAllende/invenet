# API Contract: Trades

**Base URL**: `/api/trades`  
**Auth**: All endpoints require `Authorization: Bearer <jwt>` header.  
**Content-Type**: `application/json`

---

## Existing Endpoints (feature 005, unchanged)

### GET /api/trades

List all trades for the authenticated user ordered by date descending.

**Response 200**:

```json
{
  "trades": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "accountId": "3fa85f64-5717-4562-b3fc-2c963f66afa7",
      "strategyId": null,
      "type": "BUY",
      "date": "2026-02-20T10:30:00Z",
      "symbol": "AAPL",
      "entryPrice": 175.5,
      "exitPrice": 180.0,
      "positionSize": 100.0,
      "investedAmount": 17550.0,
      "commission": 10.0,
      "profitLoss": 440.0,
      "status": "Win",
      "createdAt": "2026-02-20T10:30:00Z"
    }
  ],
  "total": 1
}
```

---

## New Endpoints (feature 006)

### POST /api/trades

Create a new trade. The trade is associated with an account that must belong to the authenticated user.

**Request**:

```json
{
  "accountId": "3fa85f64-5717-4562-b3fc-2c963f66afa7",
  "strategyId": null,
  "type": "BUY",
  "date": "2026-02-23T09:00:00Z",
  "symbol": "MSFT",
  "entryPrice": 420.0,
  "exitPrice": null,
  "positionSize": 50.0,
  "investedAmount": 21000.0,
  "commission": 5.0,
  "profitLoss": 0.0,
  "status": "Open"
}
```

**Field Rules**:
| Field | Required | Type | Constraints |
|-------|----------|------|-------------|
| accountId | ✅ | GUID | Must belong to authenticated user |
| strategyId | ❌ | GUID\|null | Must belong to authenticated user if provided |
| type | ✅ | string | `"BUY"` or `"SELL"` |
| date | ✅ | ISO 8601 string | Any valid date |
| symbol | ✅ | string | 1–20 characters |
| entryPrice | ✅ | number | > 0 |
| exitPrice | ❌ | number\|null | > 0 if provided |
| positionSize | ✅ | number | > 0 |
| investedAmount | ✅ | number | ≥ 0 |
| commission | ✅ | number | ≥ 0 |
| profitLoss | ✅ | number | any (can be negative) |
| status | ✅ | string | `"Win"`, `"Loss"`, or `"Open"` |

**Response 201**:

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
  "accountId": "3fa85f64-5717-4562-b3fc-2c963f66afa7",
  "strategyId": null,
  "type": "BUY",
  "date": "2026-02-23T09:00:00Z",
  "symbol": "MSFT",
  "entryPrice": 420.0,
  "exitPrice": null,
  "positionSize": 50.0,
  "investedAmount": 21000.0,
  "commission": 5.0,
  "profitLoss": 0.0,
  "status": "Open",
  "createdAt": "2026-02-23T09:00:00Z"
}
```

**Error Responses**:
| Status | Condition |
|--------|-----------|
| 400 | Invalid field (missing required, wrong enum value, symbol too long, negative required-positive value) |
| 401 | Missing or expired JWT |
| 403 | `accountId` does not belong to authenticated user; `strategyId` (if provided) does not belong to authenticated user |

---

### PUT /api/trades/{id}

Update an existing trade. The trade must belong to the authenticated user (verified via account ownership).

**Path Parameters**:

- `id` — GUID of the trade to update

**Request** (same fields as POST minus `accountId`):

```json
{
  "strategyId": null,
  "type": "BUY",
  "date": "2026-02-23T09:00:00Z",
  "symbol": "MSFT",
  "entryPrice": 420.0,
  "exitPrice": 430.0,
  "positionSize": 50.0,
  "investedAmount": 21000.0,
  "commission": 5.0,
  "profitLoss": 495.0,
  "status": "Win"
}
```

**Response 200**:

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
  "accountId": "3fa85f64-5717-4562-b3fc-2c963f66afa7",
  "strategyId": null,
  "type": "BUY",
  "date": "2026-02-23T09:00:00Z",
  "symbol": "MSFT",
  "entryPrice": 420.0,
  "exitPrice": 430.0,
  "positionSize": 50.0,
  "investedAmount": 21000.0,
  "commission": 5.0,
  "profitLoss": 495.0,
  "status": "Win",
  "createdAt": "2026-02-23T09:00:00Z"
}
```

**Error Responses**:
| Status | Condition |
|--------|-----------|
| 400 | Invalid field values |
| 401 | Missing or expired JWT |
| 403 | Trade does not belong to authenticated user |
| 404 | Trade not found |

---

### DELETE /api/trades/{id}

Permanently delete a trade. The trade must belong to the authenticated user.

**Path Parameters**:

- `id` — GUID of the trade to delete

**Request body**: none

**Response 204**: No content on success.

**Error Responses**:
| Status | Condition |
|--------|-----------|
| 401 | Missing or expired JWT |
| 403 | Trade does not belong to authenticated user |
| 404 | Trade not found |

---

## Serialization Notes

- All `DateTime` fields serialize as ISO 8601 UTC strings (e.g., `"2026-02-23T09:00:00Z"`).
- Nullable fields (`strategyId`, `exitPrice`) serialize as `null` when absent (not omitted).
- Enum fields (`type`, `status`) serialize as PascalCase strings: `"BUY"`, `"SELL"`, `"Win"`, `"Loss"`, `"Open"`.
- Decimal fields use standard JSON number representation with up to 4 decimal places for `positionSize` and 2 for all others.
