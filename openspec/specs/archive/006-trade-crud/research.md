# Research: Trade CRUD — Add, Edit and Delete Trades

**Feature**: 006-trade-crud  
**Phase**: Phase 0 — Resolve unknowns before design  
**Date**: 2026-02-23

---

## 1. Shell Component Pattern

**Question**: What exact component structure should the trades CRUD shell follow?

**Decision**: Mirror the `StrategiesShellComponent` pattern exactly.

**Rationale**: The strategies feature is the most direct precedent — it has create, edit (via same dialog), and delete (via `p-confirmDialog`). It uses `signal()` for `showFormDialog` and `selectedStrategy`, an `effect()` in the constructor to watch for store errors and emit toasts, and delegates mutations to the store.

**Concrete mapping**:

| Strategy                           | Trade                       |
| ---------------------------------- | --------------------------- |
| `StrategyShellComponent`           | `TradeShellComponent`       |
| `StrategyListComponent`            | `TradeListComponent`        |
| `StrategyFormComponent`            | `TradeFormComponent`        |
| `StrategiesStore.createStrategy()` | `TradesStore.createTrade()` |
| `StrategiesStore.updateStrategy()` | `TradesStore.updateTrade()` |
| `StrategiesStore.deleteStrategy()` | `TradesStore.deleteTrade()` |

**Alternatives considered**: Extending the existing `trades.ts` flat component with inline form and dialog — rejected because it violates the smart/dumb pattern required by the constitution.

---

## 2. Form Fields & Auto-Calculation

**Question**: How should Invested Amount and Profit/Loss be auto-calculated in the reactive form?

**Decision**: Use Angular `FormGroup.valueChanges` or `effect()` on specific control signals to derive values. The two derived fields are set as `disabled` controls so they are excluded from the submitted payload, and computed client-side only.

**Formula**:

- `investedAmount = positionSize × entryPrice`
- `profitLoss = exitPrice ? (exitPrice − entryPrice) × positionSize − commission : 0`

**Rationale**: These are display-only derived values that the backend also computes and stores. The form simply shows them for user feedback; the server stores authoritative values to prevent inconsistency.

**Implementation**: `effect()` reacting to `positionSize`, `entryPrice`, `exitPrice`, `commission` form control changes.

**Alternatives considered**: Sending them in the request body and letting the server calculate — rejected because FR-006/FR-007 require live in-form feedback as fields change.

---

## 3. Backend Controller Pattern for Mutations

**Question**: Should mutations use feature handlers (MediatR-style) or inline controller logic?

**Decision**: Inline controller logic (direct EF Core in the controller action), matching the existing `StrategiesController` and `AccountsController` pattern.

**Rationale**: All backend CRUD in the project is implemented directly in controllers with `ModularDbContext`. No MediatR, no handlers. Introducing a different pattern for trades would violate constitution Rule VI (Pattern Consistency).

**Concrete structure**:

- `POST /api/trades` → validates request, creates `Trade` entity, saves, returns 201 with `GetTradeResponse`
- `PUT /api/trades/{id}` → verifies ownership via account lookup, updates fields, saves, returns 200 with `GetTradeResponse`
- `DELETE /api/trades/{id}` → verifies ownership, hard-deletes row, returns 204

**Alternatives considered**: Soft-delete (flag `IsDeleted = true`) like strategies — rejected because spec says "permanently removing the record" (FR-003) and there is no audit/restore requirement for trades.

---

## 4. Account Selector Population

**Question**: Where does the account list for the form's Account selector come from?

**Decision**: Inject `AccountsStore` into `TradeShellComponent` and use `AccountsStore.accounts()` to populate the selector. Call `store.loadAccounts()` on shell init if not already loaded.

**Rationale**: `AccountsStore` is `providedIn: 'root'` so it is a singleton. Its data is already loaded when the user navigates to accounts. The trade shell can inject it without any HTTP call duplication thanks to NgRx SignalStore's singleton state.

**Alternatives considered**: Fetching accounts directly in `TradesApiService` — rejected because it duplicates state that already exists in `AccountsStore`.

---

## 5. Strategy Selector Population

**Question**: Same question for the Strategy selector.

**Decision**: Inject `StrategiesStore` into `TradeShellComponent`, use `StrategiesStore.activeStrategies()` to populate the selector. Call `store.loadStrategies({})` on shell init if not already loaded.

**Rationale**: Same singleton reasoning as accounts. Only active (non-deleted) strategies are relevant options for a new or edited trade.

**Alternatives considered**: Passing only the strategy ID on the response without a name, and resolving names client-side — accepted as the standard approach since the trade list already shows strategy names via a lookup (or omits them with "—").

---

## 6. Trade List: Existing `trades.ts` vs New Shell

**Question**: Do we refactor the existing `trades.ts` component or replace it entirely?

**Decision**: Convert `trades.ts` to a thin wrapper that renders `<lib-trade-shell>`. The existing template (table, pagination, sort) moves to `TradeListComponent`. The existing store injection moves to `TradeShellComponent`.

**Rationale**: The Angular route in `app.routes.ts` already points to the `Trades` component exported from `libs/trades`. Rather than changing the route, we keep `Trades` as the public entry point and have it delegate to the new `TradeShellComponent`. This minimises changes to the app routing.

**Alternatives considered**: Changing the app route to point at `TradeShellComponent` directly — possible but requires a route change in `apps/invenet/` which is outside the library boundary.

---

## 7. No Database Migration Required

**Question**: Does this feature require a new EF Core migration?

**Decision**: No migration required.

**Rationale**: Feature 005 (`005-trades-data-refactor`) already added all 7 new trade columns (Type, Date, PositionSize, InvestedAmount, Commission, ProfitLoss, Status) and the migration was applied. The `CreateTradeRequest` / `UpdateTradeRequest` DTOs map directly to the existing schema.

---

## 8. Error Handling Strategy

**Question**: How should the frontend handle non-2xx responses from the API?

**Decision**: Follow `StrategiesApiService`'s pattern: `catchError` in each service method maps HTTP errors to `throwError(() => new Error(message))`. The store's `rxMethod` catches these in a `catchError` block, sets `store.error`, and emits `null`. The shell's `effect()` watches `store.error()` and emits a toast via `MessageService`, then calls `store.clearError()`.

**Rationale**: Consistent with the constitution's error handling rule and the existing implementation.
