# Data Model: Trade CRUD — Add, Edit and Delete Trades

**Feature**: 006-trade-crud  
**Date**: 2026-02-23

---

## Schema Changes

**None required.** The `trades.trades` table schema is already complete from feature 005. All 15 columns (including the 7 added in the previous feature) are present and indexed.

---

## Backend DTOs

### CreateTradeRequest

Fields sent by the client to create a new trade.

```csharp
public record CreateTradeRequest(
    Guid   AccountId,
    Guid?  StrategyId,     // optional
    string Type,           // "BUY" | "SELL"
    DateTime Date,
    string Symbol,         // max 20 chars
    decimal EntryPrice,
    decimal? ExitPrice,    // optional; null while status is Open
    decimal PositionSize,
    decimal InvestedAmount,
    decimal Commission,
    decimal ProfitLoss,
    string Status          // "Win" | "Loss" | "Open"
);
```

**Validation rules (server-side)**:

- `AccountId` must belong to the authenticated user
- `Type` must be `"BUY"` or `"SELL"`
- `Symbol` must be 1–20 characters
- `EntryPrice` and `PositionSize` must be > 0
- `ExitPrice`, when provided, must be > 0
- `Status` must be `"Win"`, `"Loss"`, or `"Open"`
- `Commission` and `InvestedAmount` must be ≥ 0
- `ProfitLoss` can be any value, including negative (a losing trade will have a negative P&L)

---

### CreateTradeResponse

Returned after a successful create (HTTP 201).

```csharp
public record CreateTradeResponse(
    Guid    Id,
    Guid    AccountId,
    Guid?   StrategyId,
    string  Type,
    DateTime Date,
    string  Symbol,
    decimal EntryPrice,
    decimal? ExitPrice,
    decimal PositionSize,
    decimal InvestedAmount,
    decimal Commission,
    decimal ProfitLoss,
    string  Status,
    DateTime CreatedAt
);
```

---

### UpdateTradeRequest

Fields sent by the client to update an existing trade. All fields are required (full-replace semantics).

```csharp
public record UpdateTradeRequest(
    Guid?  StrategyId,     // optional; null clears the association
    string Type,           // "BUY" | "SELL"
    DateTime Date,
    string Symbol,
    decimal EntryPrice,
    decimal? ExitPrice,
    decimal PositionSize,
    decimal InvestedAmount,
    decimal Commission,
    decimal ProfitLoss,
    string Status
);
```

> **Note**: `AccountId` is intentionally excluded from the update request. Trades cannot be reassigned to a different account after creation.

**Validation rules**: same as CreateTradeRequest (minus `AccountId`).

---

### UpdateTradeResponse

Returned after a successful update (HTTP 200). Same shape as `CreateTradeResponse`.

```csharp
public record UpdateTradeResponse(
    Guid    Id,
    Guid    AccountId,
    Guid?   StrategyId,
    string  Type,
    DateTime Date,
    string  Symbol,
    decimal EntryPrice,
    decimal? ExitPrice,
    decimal PositionSize,
    decimal InvestedAmount,
    decimal Commission,
    decimal ProfitLoss,
    string  Status,
    DateTime CreatedAt
);
```

---

### GetTradeResponse

Single-trade response shape (reused in both create and update responses via a shared type).

```csharp
// Can be a simple alias or a shared record; 14 fields, same as CreateTradeResponse
```

---

## Frontend TypeScript DTOs

New types to add to `libs/trades/src/data-access/src/lib/models/trade.model.ts`:

```typescript
/** Payload for creating a new trade */
export interface CreateTradeRequest {
  accountId: string;
  strategyId?: string | null;
  type: 'BUY' | 'SELL';
  date: string; // ISO 8601
  symbol: string;
  entryPrice: number;
  exitPrice?: number | null;
  positionSize: number;
  investedAmount: number;
  commission: number;
  profitLoss: number;
  status: 'Win' | 'Loss' | 'Open';
}

/** Response returned after create (HTTP 201) or update (HTTP 200) */
export interface TradeResponse {
  id: string;
  accountId: string;
  strategyId?: string | null;
  type: 'BUY' | 'SELL';
  date: string;
  symbol: string;
  entryPrice: number;
  exitPrice?: number | null;
  positionSize: number;
  investedAmount: number;
  commission: number;
  profitLoss: number;
  status: 'Win' | 'Loss' | 'Open';
  createdAt: string;
}

/** Payload for updating an existing trade (same as create minus accountId) */
export type UpdateTradeRequest = Omit<CreateTradeRequest, 'accountId'>;
```

---

## Entity Relationships (unchanged)

```text
User ─── (1:N) ──► Account ─── (1:N) ──► Trade ◄─── (N:0-1) ─── Strategy
```

- A `Trade` belongs to exactly one `Account`.
- A `Trade` optionally belongs to one `Strategy`.
- Both `Account` and `Strategy` are scoped to the authenticated `User` (enforced server-side).

---

## State Shape (TradesStore additions)

The NgRx SignalStore state type gains no new fields. Mutations reuse `isLoading` and `error` from the existing state. After a successful create, the new trade is added via `addEntity`. After a successful update, it is updated via `updateEntity`. After a successful delete, it is removed via `removeEntity`.

```typescript
// No new state fields needed
// New entity operations from @ngrx/signals/entities:
//   addEntity(response)       — after create
//   updateEntity(...)         — after update
//   removeEntity(id)          — after delete
```
