# Data Model: Trade Strategy Association

**Date**: February 18, 2026  
**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Research**: [research.md](./research.md)

## Overview

This document defines the data entities, relationships, and validation rules for the Trade Strategy Association feature. The model introduces a new `Strategy` entity and extends the existing `Trade` entity with an optional strategy reference.

## Entities

### Strategy

Represents a named trading approach or methodology created by a trader to categorize their trades.

#### Fields

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `id` | UUID | Yes | Primary key, auto-generated | Unique identifier for the strategy |
| `accountId` | UUID | Yes | Foreign key to Account | Owner of this strategy (account-scoped) |
| `name` | String | Yes | Max 200 chars, Trim whitespace | Human-readable strategy name |
| `description` | String | No | Max 2000 chars | Optional detailed description of the strategy |
| `isDeleted` | Boolean | Yes | Default: false | Soft delete flag |
| `createdAt` | DateTime | Yes | Auto-set on create | Timestamp of strategy creation |
| `updatedAt` | DateTime | Yes | Auto-set on create/update | Timestamp of last update |

#### Validation Rules

1. **Name Required**: Cannot be null, empty, or whitespace only
2. **Name Max Length**: 200 characters maximum
3. **Name Uniqueness**: Must be unique within the account (case-sensitive) for active strategies
4. **Description Max Length**: 2000 characters if provided
5. **Account Association**: Must belong to a valid, existing account

#### Business Rules

- Strategies are account-scoped: Never visible across different accounts
- Soft delete only: Strategies referenced by trades cannot be hard-deleted
- Name trimming: Leading/trailing whitespace automatically removed before save
- Duplicate names: Prevented by database constraint for active strategies (is_deleted = false)

#### Indexes

```sql
-- Primary key index (automatic)
PRIMARY KEY (id)

-- Foreign key index for account lookups
INDEX idx_strategies_account_id ON strategies(account_id)

-- Unique constraint for active strategy names per account
UNIQUE INDEX idx_strategies_account_name_unique 
  ON strategies(account_id, name) 
  WHERE is_deleted = FALSE

-- Query optimization for listing active strategies
INDEX idx_strategies_active ON strategies(account_id, is_deleted)
```

---

### Trade (Modified)

Existing entity extended with optional strategy reference.

#### New Fields

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `strategyId` | UUID | No | Foreign key to Strategy (nullable) | Associated trading strategy |

#### Relationship

- **Trade → Strategy**: Many-to-One (optional)
  - One trade can have zero or one strategy
  - One strategy can be associated with many trades
  - Nullable foreign key relationship

#### Validation Rules (New)

1. **Strategy Existence**: If strategyId provided, must reference existing strategy
2. **Strategy Account Match**: If strategyId provided, strategy must belong to same account as trade
3. **Deleted Strategy**: Cannot assign deleted strategy (is_deleted = true) to new/updated trades
4. **Orphan Handling**: Existing trades keep strategy reference even if strategy is soft-deleted (for historical data)

#### Indexes (New)

```sql
-- Foreign key index for strategy lookups
INDEX idx_trades_strategy_id ON trades(strategy_id)

-- Composite index for filtering trades by strategy for an account
INDEX idx_trades_account_strategy ON trades(account_id, strategy_id)
```

---

## Relationships Diagram

```
┌─────────────────┐
│    Account      │
│  (existing)     │
└────────┬────────┘
         │ 1
         │ owns
         │
         ├────────────────────┐
         │                    │
         │ *                  │ *
┌────────▼────────┐   ┌───────▼────────┐
│    Strategy     │   │     Trade      │
│     (new)       │   │   (existing)   │
│─────────────────│   │────────────────│
│ id (PK)         │   │ id (PK)        │
│ accountId (FK)  │   │ accountId (FK) │
│ name            │◄──┤ strategyId (FK)│ (optional)
│ description     │ * │ ... (other     │
│ isDeleted       │   │  trade fields) │
│ createdAt       │   └────────────────┘
│ updatedAt       │
└─────────────────┘

Legend:
  1 = one
  * = many
  ◄─ = relationship direction
  (PK) = Primary Key
  (FK) = Foreign Key
```

## State Transitions

### Strategy Lifecycle

```
                                                ┌─────────────┐
                                                │   Deleted   │
                                                │ (soft)      │
                                                │ isDeleted=T │
                                                └──────▲──────┘
                                                       │
                                                       │ DELETE
                                                       │
  ┌──────────┐   CREATE    ┌──────────┐   UPDATE    ┌─┴───────────┐
  │          │─────────────►│          │◄───────────►│             │
  │  None    │              │  Active  │             │   Active    │
  │          │              │  New     │             │   Modified  │
  └──────────┘              └──────────┘             └─────────────┘
                                                            │
                                                            │ Trades exist
                                                            │ + DELETE
                                                            ▼
                                          Soft delete (can be recovered
                                          via admin action if needed)
```

**States**:
1. **None**: Strategy does not exist
2. **Active (New)**: Strategy created, no modifications yet
3. **Active (Modified)**: Strategy name or description updated
4. **Deleted (Soft)**: Strategy marked as deleted, not visible in lists, preserved for historical trade references

**Transitions**:
- **CREATE**: User creates new strategy → Active state
- **UPDATE**: User edits name or description → Modified state
- **DELETE**: User deletes strategy → Deleted state (soft delete)
- **Recovery** (admin feature, out of scope for MVP): Set isDeleted = false → back to Active

### Trade-Strategy Association

```
  Trade Created/Updated        Strategy Selected?
         │                            │
         │                            │
         ▼                            ▼
  ┌─────────────┐             ┌──────────────┐
  │ No Strategy │             │   Strategy   │
  │ Assigned    │             │   Assigned   │
  │ (null)      │◄───────────►│ (strategyId) │
  └─────────────┘   Update    └──────────────┘
                    Trade                │
                                         │ Strategy Deleted
                                         ▼
                                  ┌──────────────┐
                                  │   Orphaned   │
                                  │  Reference   │
                                  │  (kept for   │
                                  │   history)   │
                                  └──────────────┘
```

**States**:
1. **No Strategy**: Trade has null strategyId (allowed)
2. **Strategy Assigned**: Trade has valid strategyId reference
3. **Orphaned Reference**: Trade has strategyId, but strategy is soft-deleted (read-only, for historical context)

**Transitions**:
- User can add strategy to trade without one
- User can change strategy on trade
- User can remove strategy from trade (set to null)
- System preserves strategyId even when strategy is soft-deleted

## Validation Rules Summary

### Strategy Entity

| Rule | Type | Description |
|------|------|-------------|
| STR-001 | Required | Name must not be null, empty, or whitespace |
| STR-002 | Length | Name must be ≤ 200 characters |
| STR-003 | Uniqueness | Name must be unique per account (for active strategies) |
| STR-004 | Length | Description must be ≤ 2000 characters if provided |
| STR-005 | Reference | AccountId must reference existing account |
| STR-006 | Immutability | Id, createdAt cannot be changed after creation |

### Trade-Strategy Relationship

| Rule | Type | Description |
|------|------|-------------|
| TS-001 | Optional | StrategyId can be null (strategy assignment optional) |
| TS-002 | Reference | If strategyId provided, must reference existing strategy |
| TS-003 | Ownership | Strategy must belong to same account as trade |
| TS-004 | Business | Cannot assign soft-deleted strategy to trade |
| TS-005 | History | Preserves strategyId reference even if strategy soft-deleted later |

## Database Schema (PostgreSQL)

### New Table: strategies

```sql
CREATE SCHEMA IF NOT EXISTS strategies;

CREATE TABLE strategies.strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_strategy_account 
        FOREIGN KEY (account_id) 
        REFERENCES accounts.accounts(id) 
        ON DELETE CASCADE,
    
    -- Unique constraint for active strategy names per account
    CONSTRAINT uq_strategy_account_name 
        UNIQUE (account_id, name) 
        WHERE (is_deleted = FALSE)
);

-- Indexes
CREATE INDEX idx_strategies_account_id 
    ON strategies.strategies(account_id);

CREATE INDEX idx_strategies_active 
    ON strategies.strategies(account_id, is_deleted);

-- Trigger for updated_at auto-update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_strategies_updated_at
    BEFORE UPDATE ON strategies.strategies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### Modified Table: trades

```sql
-- Add strategy_id column to existing trades table
ALTER TABLE trades.trades
    ADD COLUMN strategy_id UUID;

-- Add foreign key constraint
ALTER TABLE trades.trades
    ADD CONSTRAINT fk_trade_strategy
        FOREIGN KEY (strategy_id)
        REFERENCES strategies.strategies(id)
        ON DELETE SET NULL;  -- If strategy deleted, set trade.strategy_id to NULL (alt approach to soft delete)

-- Add index for filtering/lookups
CREATE INDEX idx_trades_strategy_id 
    ON trades.trades(strategy_id);

CREATE INDEX idx_trades_account_strategy 
    ON trades.trades(account_id, strategy_id);
```

**Note**: Since strategy uses soft delete (is_deleted flag), the `ON DELETE SET NULL` may not trigger. The application logic prevents hard deletes. This is a safety fallback.

## Migration Strategy

1. **Add strategies table**: Create new schema and table with all constraints
2. **Add strategy_id to trades**: Nullable column, no data migration needed
3. **Create indexes**: For performance
4. **No data backfill**: Existing trades remain with null strategy_id (valid state)
5. **Rollback plan**: Drop foreign key, drop column, drop table (in reverse order)

## Sample Data

### Example Strategies

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "accountId": "account-uuid-1",
    "name": "Breakout Momentum",
    "description": "Trade on strong breakouts above resistance with volume confirmation",
    "isDeleted": false,
    "createdAt": "2026-02-01T10:00:00Z",
    "updatedAt": "2026-02-01T10:00:00Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "accountId": "account-uuid-1",
    "name": "Mean Reversion",
    "description": "Buy oversold conditions, sell overbought conditions using RSI",
    "isDeleted": false,
    "createdAt": "2026-02-02T14:30:00Z",
    "updatedAt": "2026-02-05T09:15:00Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "accountId": "account-uuid-1",
    "name": "Swing Trading",
    "description": null,
    "isDeleted": true,  // Soft deleted
    "createdAt": "2026-01-15T08:00:00Z",
    "updatedAt": "2026-02-10T16:20:00Z"
  }
]
```

### Example Trade with Strategy

```json
{
  "id": "trade-uuid-123",
  "accountId": "account-uuid-1",
  "symbol": "AAPL",
  "entryPrice": 150.00,
  "exitPrice": 155.00,
  "strategyId": "550e8400-e29b-41d4-a716-446655440001",  // References "Breakout Momentum"
  "createdAt": "2026-02-15T10:30:00Z",
  "updatedAt": "2026-02-15T15:45:00Z"
}
```

## Frontend Models (TypeScript)

```typescript
// libs/strategies/src/lib/strategies/data-access/models/strategy.model.ts
export interface Strategy {
  id: string;
  accountId: string;
  name: string;
  description?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStrategyDto {
  name: string;
  description?: string;
}

export interface UpdateStrategyDto {
  name?: string;
  description?: string;
}

// libs/trades/src/lib/trades/data-access/models/trade.model.ts (modified)
export interface Trade {
  id: string;
  accountId: string;
  // ... existing trade fields
  strategyId?: string;        // NEW: optional
  strategyName?: string;      // NEW: denormalized for display (from API response)
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTradeDto {
  // ... existing fields
  strategyId?: string;  // NEW: optional
}
```

## Backend Models (C#)

```csharp
// apps/api/Invenet.Api/Modules/Strategies/Domain/Strategy.cs
public class Strategy : BaseEntity
{
    public Guid Id { get; set; }
    public Guid AccountId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Navigation property
    public Account Account { get; set; } = null!;
    public ICollection<Trade> Trades { get; set; } = new List<Trade>();
}

// apps/api/Invenet.Api/Modules/Trades/Domain/Trade.cs (modified)
public class Trade : BaseEntity
{
    // ... existing properties
    public Guid? StrategyId { get; set; }  // NEW: nullable FK
    
    // Navigation property
    public Strategy? Strategy { get; set; }  // NEW
}
```

## Data Flow

### Create Strategy Flow

```
User → Frontend Component → SignalStore → API Service → Controller → Handler → EF Core → PostgreSQL
                                                                                               │
                                                                                               ├→ Validate uniqueness
                                                                                               ├→ Trim name
                                                                                               ├→ Set timestamps
                                                                                               └→ INSERT
```

### Assign Strategy to Trade Flow

```
User → Trade Form → Select Strategy → Submit → API → Validate StrategyId → Update Trade → PostgreSQL
                                                         │
                                                         ├→ Strategy exists?
                                                         ├→ Strategy belongs to account?
                                                         └→ Strategy not deleted?
```

## Error Scenarios

| Scenario | Validation | Error Response |
|----------|-----------|----------------|
| Create strategy with empty name | STR-001 | 400 Bad Request: "Name is required" |
| Create strategy with duplicate name | STR-003 | 409 Conflict: "A strategy with this name already exists" |
| Create strategy with 300-char name | STR-002 | 400 Bad Request: "Name must be 200 characters or less" |
| Assign non-existent strategy to trade | TS-002 | 404 Not Found: "Strategy not found" |
| Assign deleted strategy to trade | TS-004 | 400 Bad Request: "Cannot assign deleted strategy" |
| Assign strategy from different account | TS-003 | 403 Forbidden: "Strategy does not belong to your account" |
