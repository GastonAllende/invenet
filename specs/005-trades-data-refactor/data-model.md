# Data Model: Trades Data Refactor

**Branch**: `005-trades-data-refactor`  
**Date**: 2026-02-22

---

## Entity: Trade

### Backend — C# Domain Entity (`Domain/Trade.cs`)

```csharp
public class Trade
{
    public Guid Id { get; set; }
    public Guid AccountId { get; set; }          // required — links to owning account
    public Guid? StrategyId { get; set; }        // nullable — optional strategy

    // --- NEW FIELDS ---
    public TradeType Type { get; set; }          // BUY | SELL
    public DateTime Date { get; set; }           // trade execution date
    public string Symbol { get; set; }           // existing — kept
    public decimal EntryPrice { get; set; }      // existing — kept
    public decimal? ExitPrice { get; set; }      // existing — kept, nullable
    public decimal PositionSize { get; set; }    // number of units/shares
    public decimal InvestedAmount { get; set; }  // entryPrice × positionSize
    public decimal Commission { get; set; }      // default 0
    public decimal ProfitLoss { get; set; }      // default 0 while open
    public TradeStatus Status { get; set; }      // Win | Loss | Open

    // Audit
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public Strategy? Strategy { get; set; }
}

public enum TradeType { BUY, SELL }
public enum TradeStatus { Win, Loss, Open }
```

### Backend — EF Core Configuration changes (`Infrastructure/Data/TradeConfiguration.cs`)

New property mappings to add:

```csharp
builder.Property(t => t.Type)
    .IsRequired()
    .HasMaxLength(4)
    .HasConversion<string>();   // stored as "BUY"/"SELL"

builder.Property(t => t.Date)
    .IsRequired();

builder.Property(t => t.PositionSize)
    .IsRequired()
    .HasColumnType("decimal(18,4)");

builder.Property(t => t.InvestedAmount)
    .IsRequired()
    .HasColumnType("decimal(18,2)");

builder.Property(t => t.Commission)
    .IsRequired()
    .HasColumnType("decimal(18,2)")
    .HasDefaultValue(0m);

builder.Property(t => t.ProfitLoss)
    .IsRequired()
    .HasColumnType("decimal(18,2)")
    .HasDefaultValue(0m);

builder.Property(t => t.Status)
    .IsRequired()
    .HasMaxLength(10)
    .HasConversion<string>();   // stored as "Open"/"Win"/"Loss"
```

Additional index to add:

```csharp
builder.HasIndex(t => t.Date)
    .HasDatabaseName("ix_trades_date");

builder.HasIndex(t => new { t.AccountId, t.Date })
    .HasDatabaseName("ix_trades_account_date");
```

---

### Database Schema — `trades.trades` table

| Column            | PostgreSQL Type | Nullable | Notes                               |
| ----------------- | --------------- | -------- | ----------------------------------- |
| `id`              | `uuid`          | NOT NULL | PK, gen by EF                       |
| `account_id`      | `uuid`          | NOT NULL | FK implied; indexed                 |
| `strategy_id`     | `uuid`          | NULL     | FK → strategies; ON DELETE SET NULL |
| `symbol`          | `varchar(20)`   | NOT NULL | ticker symbol                       |
| `type`            | `varchar(4)`    | NOT NULL | `'BUY'` or `'SELL'`                 |
| `date`            | `timestamp`     | NOT NULL | trade execution date                |
| `entry_price`     | `decimal(18,2)` | NOT NULL |                                     |
| `exit_price`      | `decimal(18,2)` | NULL     | null while open                     |
| `position_size`   | `decimal(18,4)` | NOT NULL |                                     |
| `invested_amount` | `decimal(18,2)` | NOT NULL |                                     |
| `commission`      | `decimal(18,2)` | NOT NULL | default 0                           |
| `profit_loss`     | `decimal(18,2)` | NOT NULL | default 0                           |
| `status`          | `varchar(10)`   | NOT NULL | `'Open'` / `'Win'` / `'Loss'`       |
| `created_at`      | `timestamp`     | NOT NULL |                                     |
| `updated_at`      | `timestamp`     | NOT NULL |                                     |

**Indexes**:

- `ix_trades_account_id` (existing)
- `ix_trades_strategy_id` (existing)
- `ix_trades_account_strategy` (existing)
- `ix_trades_date` (**new**)
- `ix_trades_account_date` (**new**)

---

### EF Core Migration: `AddTradeFields`

Migration adds 7 columns to `trades.trades` with safe defaults for any existing rows:

```
type           varchar(4)    NOT NULL DEFAULT 'BUY'
date           timestamp     NOT NULL DEFAULT NOW()
position_size  decimal(18,4) NOT NULL DEFAULT 0
invested_amount decimal(18,2) NOT NULL DEFAULT 0
commission     decimal(18,2) NOT NULL DEFAULT 0
profit_loss    decimal(18,2) NOT NULL DEFAULT 0
status         varchar(10)   NOT NULL DEFAULT 'Open'
```

Plus 2 new indexes (`ix_trades_date`, `ix_trades_account_date`).

---

### Backend — Response DTO (`Features/ListTrades/ListTradesResponse.cs`)

```csharp
public record ListTradesResponse(
    List<TradeListItem> Trades,
    int Total
);

public record TradeListItem(
    Guid Id,
    Guid AccountId,
    Guid? StrategyId,
    string Type,          // "BUY" | "SELL"
    DateTime Date,
    string Symbol,
    decimal EntryPrice,
    decimal? ExitPrice,
    decimal PositionSize,
    decimal InvestedAmount,
    decimal Commission,
    decimal ProfitLoss,
    string Status,        // "Win" | "Loss" | "Open"
    DateTime CreatedAt
);
```

---

### Frontend — TypeScript Model (`lib/models/trade.model.ts`)

```typescript
export interface Trade {
  id: string; // UUID from backend
  accountId: string;
  strategyId?: string | null;
  type: 'BUY' | 'SELL';
  date: string; // ISO 8601 string from JSON
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

export interface ListTradesResponse {
  trades: Trade[];
  total: number;
}
```

**Note**: `status` casing (`'Win'`/`'Loss'`/`'Open'`) matches the C# enum `ToString()` output. The frontend severity helper is updated to match: `'Win' → 'success'`, `'Loss' → 'danger'`, `'Open' → 'info'`. Similarly `type` severity: `'BUY' → 'success'`, `'SELL' → 'danger'`.

---

## Entity Relationships (unchanged)

```
User (AspNetUsers)
 └── 1:N Account (accounts.accounts)
              └── 1:N Trade (trades.trades)
                           └── N:1 Strategy (strategies.strategies) [optional]
```

No relationship changes in this feature. The `Trade → Account` link is used for authorization (filtering by user's accounts). The `Trade → Strategy` link is read-only and nullable.

---

## Validation Rules

| Field            | Rule                                              |
| ---------------- | ------------------------------------------------- |
| `symbol`         | Required, max 20 chars                            |
| `type`           | Must be `BUY` or `SELL`                           |
| `status`         | Must be `Win`, `Loss`, or `Open`                  |
| `entryPrice`     | Required, > 0                                     |
| `positionSize`   | Required, > 0                                     |
| `investedAmount` | Required, ≥ 0                                     |
| `commission`     | Required, ≥ 0 (default 0)                         |
| `profitLoss`     | Required (default 0 while open)                   |
| `exitPrice`      | Nullable; required when status is `Win` or `Loss` |
| `date`           | Required, must be a valid datetime                |
| `accountId`      | Must belong to the authenticated user             |
