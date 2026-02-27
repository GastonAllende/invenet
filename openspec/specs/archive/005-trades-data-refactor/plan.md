# Implementation Plan: Trades Data Refactor

**Branch**: `005-trades-data-refactor` | **Date**: 2026-02-22 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/005-trades-data-refactor/spec.md`

## Summary

Refactor the Trades feature end-to-end: extend the backend `Trade` domain entity and EF Core migration with 7 missing fields (type, positionSize, investedAmount, commission, profitLoss, status, date), implement a real `GET /api/trades` endpoint scoped to the authenticated user's accounts, add a NgRx SignalStore + HTTP service on the frontend, and replace all hardcoded sample data in the trades table with live API data. No new packages are introduced; the implementation follows the established Accounts module pattern exactly.

## Technical Context

**Frontend Language/Version**: TypeScript 5.x / Angular 21.1 (standalone components, signals, NgRx SignalStore 19+)  
**Backend Language/Version**: C# 13 / .NET 10 / ASP.NET Core with EF Core 10 (Npgsql)  
**UI Library**: PrimeNG 21.1 (p-table, p-card, p-tag, p-button)  
**Storage**: PostgreSQL — `trades` schema, `trades` table. EF Core migrations via `dotnet ef migrations add`  
**Testing**: Frontend — Vitest (unit). Backend — xUnit. E2E — Playwright  
**Target Platform**: Web SPA (Angular) + Linux/Docker API server (.NET)  
**Performance Goals**: List endpoint <2 s p95; client-side pagination handles up to 1,000 rows without degradation  
**Constraints**: No new npm or NuGet packages. No accessibility additions. User data isolated by `AccountId` (multi-tenant).  
**Scale/Scope**: Single authenticated user's trades list; client-side sort/pagination is sufficient for current volume.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                     | Status       | Notes                                                                                                                                                                                                                |
| ----------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Nx Monorepo boundaries     | ✅ PASS      | `libs/trades` and `apps/api/Invenet.Api/Modules/Trades` already exist. No new libraries or modules created.                                                                                                          |
| II. Angular standards         | ✅ PASS      | Standalone component, signal-based state (`signal()`), NgRx SignalStore, PrimeNG, OnPush — all followed.                                                                                                             |
| III. Backend modular monolith | ✅ PASS      | New code adds to existing `Trades` module only: `Domain/`, `Features/ListTrades/`, `API/TradesController.cs`.                                                                                                        |
| IV. Zero accessibility        | ✅ PASS      | No ARIA or a11y additions beyond PrimeNG defaults.                                                                                                                                                                   |
| V. Testing & quality          | ⚠️ EXCEPTION | Tests are explicitly out of scope per user direction. No new Vitest or xUnit tests will be written. `trades.spec.ts` will not be updated. Mitigation: manual smoke test (T026) covers all user stories before merge. |
| VI. Pattern consistency       | ✅ PASS      | Follows `AccountsApiService` + `AccountsStore` pattern exactly. Table layout consistent with accounts list.                                                                                                          |
| VII. Minimal dependencies     | ✅ PASS      | Zero new npm or NuGet packages. All needed primitives already in the stack.                                                                                                                                          |

**Post-design re-check**: ✅ No violations introduced by Phase 1 design decisions.

## Constitution Exceptions

| Principle            | Exception Rationale                                                                                                                                                                       | Mitigation                                                                                                                                           |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| V. Testing & quality | User explicitly excluded tests from this feature's scope. No Vitest unit tests for `TradesStore`/`TradesApiService` and no xUnit tests for `TradesController` are included in `tasks.md`. | T026 (manual smoke test per `quickstart.md`) covers all 3 user story acceptance scenarios before merge. Peer review required before merging to main. |

## Project Structure

### Documentation (this feature)

```text
specs/005-trades-data-refactor/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── trades-api.md
└── tasks.md             # Phase 2 output (created by /speckit.tasks — not yet)
```

### Source Code

```text
# Backend (modular monolith)
apps/api/Invenet.Api/Modules/Trades/
├── Domain/
│   └── Trade.cs                          # ADD: 7 new fields + 2 enums
├── Infrastructure/Data/
│   └── TradeConfiguration.cs             # UPDATE: map new fields
├── Migrations/
│   └── <timestamp>_AddTradeFields.cs     # NEW: EF Core migration
├── Features/ListTrades/
│   └── ListTradesResponse.cs             # NEW: response DTO
└── API/
    └── TradesController.cs               # UPDATE: implement GET /api/trades

# Frontend (Nx library — mirrors libs/accounts pattern)
libs/trades/src/
├── data-access/
│   └── src/
│       ├── index.ts                          # NEW: re-export data-access public API
│       └── lib/
│           ├── models/
│           │   └── trade.model.ts            # NEW: Trade interface + types
│           ├── services/
│           │   └── trades-api.service.ts     # NEW: HTTP service
│           └── store/
│               └── trades.store.ts           # NEW: NgRx SignalStore
├── lib/
│   └── trades/
│       ├── trades.ts                         # UPDATE: use store, remove hardcoded data
│       ├── trades.html                       # UPDATE: correct columns
│       ├── trades.css                        # no change
│       └── trades.spec.ts                    # no change (tests out of scope)
└── index.ts                              # UPDATE: export component + re-export from ./data-access/src
```

**Structure Decision**: Web application (Angular SPA + .NET API). Frontend refactor stays within `libs/trades`; backend refactor stays within `Modules/Trades`. No new libraries or modules. Pattern mirrors the existing `libs/accounts` / `Accounts` module exactly.

## Complexity Tracking

> Constitution exception for Principle V (Testing) documented in the Constitution Exceptions table above.
