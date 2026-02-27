# Phase 0 Research: Trades Data Refactor

**Branch**: `005-trades-data-refactor`  
**Date**: 2026-02-22

All unknowns resolved by reading the existing codebase. No external research needed.

---

## Decision 1: Frontend Service + State Pattern

**Decision**: Mirror the `AccountsApiService` + `AccountsStore` pattern exactly.

**Rationale**: The codebase constitution mandates pattern consistency (Principle VI). `libs/accounts/src/data-access/` is the canonical example: an `@Injectable({ providedIn: 'root' })` HTTP service injected into an NgRx SignalStore, which the component consumes via signals. This is already in use and well-understood.

**Implementation detail**: The trades lib is simpler than accounts (read-only in this scope), so a flat structure inside `libs/trades/src/lib/` is sufficient — no need for the deeper `data-access/src/lib/` nesting accounts uses.

**Alternatives considered**:

- Direct HTTP call in component: rejected— violates SignalStore mandate and pattern consistency.
- Custom RxJS service without a store: rejected — constitution requires NgRx SignalStore for shared state.

---

## Decision 2: Backend Controller Inline vs. Feature Handler

**Decision**: Implement the `GET /api/trades` logic directly in `TradesController` (same as all accounts handlers which inline EF Core queries via `ModularDbContext`).

**Rationale**: Inspecting `AccountsController.cs` confirms the project does **not** use a MediatR/CQRS dispatcher. Feature handler files (`Features/ListAccounts/ListAccountsResponse.cs`) only contain response DTOs; the actual query logic lives in the controller method. The `TradesController` should follow the same pattern.

**Alternatives considered**:

- Adding MediatR: not in the stack, would introduce a new dependency — rejected by Principle VII.
- Handler class with explicit `Handle()` method: no existing precedent in this codebase — rejected.

---

## Decision 3: Trade Enum Storage Strategy

**Decision**: Store `Type` (BUY/SELL) and `Status` (Win/Loss/Open) as `string` columns (max-length constrained) in PostgreSQL, not as integer-backed enums.

**Rationale**: EF Core + Npgsql stores C# enums as integers by default, which makes the database unreadable and harder to query. The spec requires the API to return `"BUY"/"SELL"` and `"win"/"loss"/"open"` as strings. Using `.HasConversion<string>()` in `TradeConfiguration` ensures the column stores the string representation and avoids migration pain when enum values are reordered.

**Alternatives considered**:

- Integer-backed enum: rejected — DB unreadable, API serialisation needs extra config.
- PostgreSQL native enum type: rejected — adds Npgsql-specific complexity and harder to migrate.

---

## Decision 4: `Date` Field Naming and Type

**Decision**: Add a `DateTime Date` property to the `Trade` entity (stored as `timestamp without time zone`, named column `date`). This stores the trade execution date, distinct from the existing `CreatedAt`/`UpdatedAt` audit timestamps.

**Rationale**: The spec explicitly states "the `date` field represents trade execution date, not `createdAt`". Having a separate `Date` field keeps audit data immutable and separate from business data.

**Alternatives considered**:

- Re-using `CreatedAt` as execution date: rejected — conflates audit and business data.

---

## Decision 5: `AccountId` Filtering

**Decision**: The `GET /api/trades` endpoint returns trades where `AccountId` matches any account owned by the authenticated user. User identity is read from `ClaimTypes.NameIdentifier` via `GetCurrentUserId()`, already implemented in `AccountsController` and replicated for `TradesController`.

**Rationale**: The current `Trade` entity has `AccountId` (the linked brokerage account), and `Account` has `UserId`. A simple JOIN or subquery: `WHERE trade.AccountId IN (SELECT id FROM accounts WHERE UserId = currentUserId)`. EF Core: `.Where(t => userAccountIds.Contains(t.AccountId))`.

**Alternatives considered**:

- Adding `UserId` directly to `Trade`: rejected — the spec's model does not include it and it would denormalize the schema. Filtering via the Account relationship is sufficient.

---

## Decision 6: Migration Strategy

**Decision**: Single EF Core migration `AddTradeFields` adds all 7 missing columns with appropriate defaults to avoid breaking existing (empty) rows.

**New columns and their safe defaults**:
| Column | Type | Default |
|--------|------|---------|
| `type` | `varchar(4)` | `'BUY'` (required) |
| `position_size` | `decimal(18,4)` | `0` (required) |
| `invested_amount` | `decimal(18,2)` | `0` (required) |
| `commission` | `decimal(18,2)` | `0` (required) |
| `profit_loss` | `decimal(18,2)` | `0` (required) |
| `status` | `varchar(10)` | `'open'` (required) |
| `date` | `timestamp` | `now()` (required) |

After migration, the defaults can optionally be dropped (out of scope — no existing rows expected in a dev environment).

**Alternatives considered**:

- Nullable columns: rejected — the spec defines these as required fields; nullable would leak into the API model unnecessarily.

---

## Decision 7: Frontend `Trade` ID Type

**Decision**: Keep `id` as `string` on the frontend TypeScript model (UUID from backend), not `number` as the original spec interface showed.

**Rationale**: The backend `Trade` entity uses `Guid Id`. The original frontend spec interface said `id: number` but this is inconsistent with a UUID-based backend. The accounts pattern uses `string` IDs throughout. NgRx SignalStore `withEntities` uses the `id` field for entity normalization and works with string IDs.

**Alternatives considered**:

- Keep `id: number`: rejected — backend returns UUID strings; `number` would cause type errors on parse.

---

## Resolved NEEDS CLARIFICATION Items

None were present in the spec. All items above were identified from code inspection.
