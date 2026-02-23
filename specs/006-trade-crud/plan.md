# Implementation Plan: Trade CRUD — Add, Edit and Delete Trades

**Branch**: `006-trade-crud` | **Date**: 2026-02-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-trade-crud/spec.md`

## Summary

Extend the Trade History feature with full CRUD operations (create, edit, delete) using a PrimeNG modal dialog and confirmation prompt, following the exact pattern established by the Strategies and Accounts features. The database schema is already complete (feature 005). This feature adds three new backend endpoints, three new store actions, and three new frontend components (shell, form, list), with no new external dependencies.

## Technical Context

**Frontend Language/Version**: TypeScript 5.x / Angular 21.1 (standalone components, signals, NgRx SignalStore)
**Backend Language/Version**: C# 13 / .NET 10 / ASP.NET Core with EF Core 10 (Npgsql)
**Primary Dependencies**: PrimeNG 21.1 (Dialog, ConfirmDialog, Toast, Select, DatePicker, InputNumber), NgRx SignalStore, Angular ReactiveFormsModule
**Storage**: PostgreSQL — `trades.trades` table (schema complete from feature 005; no new migrations required)
**Testing**: Vitest (frontend unit tests), XUnit (backend unit tests)
**Target Platform**: Web (browser + ASP.NET Core API)
**Project Type**: web
**Performance Goals**: CRUD API responses <2 seconds; dialog open/close <200ms
**Constraints**: UserId-based data scoping enforced server-side on every mutating operation; no bulk operations in scope
**Scale/Scope**: Single-user data slice; consistent with existing CRUD features

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design._

| Gate                            | Status  | Notes                                                                                 |
| ------------------------------- | ------- | ------------------------------------------------------------------------------------- |
| Nx library boundaries respected | ✅ PASS | All frontend work in `libs/trades`; no cross-lib circular deps                        |
| Standalone components only      | ✅ PASS | No NgModules; all new components use `imports: [...]`                                 |
| Signal-based reactivity         | ✅ PASS | Shell uses `signal()` for dialog/selected state; form uses `effect()` for patch       |
| NgRx SignalStore for state      | ✅ PASS | `TradesStore` extended with `createTrade`, `updateTrade`, `deleteTrade` rxMethods     |
| PrimeNG for all UI              | ✅ PASS | Dialog, ConfirmDialog, Toast, Select, DatePicker, InputNumber — all existing          |
| Smart/dumb component pattern    | ✅ PASS | Shell orchestrates; TradeListComponent and TradeFormComponent are presentational      |
| OnPush change detection         | ✅ PASS | Applied to all new components                                                         |
| No accessibility additions      | ✅ PASS | Zero ARIA additions; PrimeNG defaults only                                            |
| UserId-based authorization      | ✅ PASS | `GetCurrentUserId()` called in every controller action; all queries filtered by owner |
| No new npm/NuGet packages       | ✅ PASS | All PrimeNG modules and Angular imports already in use                                |
| No N+1 queries                  | ✅ PASS | Single-entity mutations; list reload uses existing bulk query                         |
| Bundle size <500KB gzipped      | ✅ PASS | No new libraries; already-used PrimeNG modules only                                   |

**Post-Design Re-Check**: No violations introduced by Phase 1 design.

## Project Structure

### Documentation (this feature)

```text
specs/006-trade-crud/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── trades-api.md    ← Phase 1 output (adds POST, PUT, DELETE to existing GET)
└── tasks.md             ← Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (web application)

```text
# Backend  (working dir: apps/api/Invenet.Api/)
apps/api/Invenet.Api/Modules/Trades/
├── API/
│   └── TradesController.cs                MODIFY — add Create, Update, Delete actions
├── Features/
│   ├── ListTrades/
│   │   └── ListTradesResponse.cs          EXISTING — no change
│   ├── CreateTrade/
│   │   ├── CreateTradeRequest.cs          NEW
│   │   └── CreateTradeResponse.cs         NEW
│   ├── UpdateTrade/
│   │   ├── UpdateTradeRequest.cs          NEW
│   │   └── UpdateTradeResponse.cs         NEW
│   └── GetTrade/
│       └── GetTradeResponse.cs            NEW (shared response shape for create/update)
└── Domain/
    └── Trade.cs                           EXISTING — no change

# Frontend  (working dir: repo root)
libs/trades/src/
├── lib/
│   ├── trades/
│   │   └── trades.ts                      MODIFY → delegates to TradeShellComponent
│   ├── feature/
│   │   └── trade-shell/
│   │       ├── trade-shell.component.ts   NEW — orchestrates dialog + confirm + toast
│   │       ├── trade-shell.component.html NEW
│   │       └── trade-shell.component.css  NEW
│   └── ui/
│       ├── trade-list/
│       │   ├── trade-list.component.ts    NEW — presentational table w/ edit/delete buttons
│       │   ├── trade-list.component.html  NEW
│       │   └── trade-list.component.css   NEW
│       └── trade-form/
│           ├── trade-form.component.ts    NEW — reactive form, auto-calc invested/PnL
│           ├── trade-form.component.html  NEW
│           └── trade-form.component.css   NEW
└── data-access/src/lib/
    ├── models/
    │   └── trade.model.ts                 MODIFY — add CreateTradeRequest, UpdateTradeRequest,
    │                                                TradeResponse DTOs
    ├── services/
    │   └── trades-api.service.ts          MODIFY — add create(), update(), delete()
    └── store/
        └── trades.store.ts                MODIFY — add createTrade, updateTrade, deleteTrade
```

## Complexity Tracking

No constitution violations. No complexity entries required.
