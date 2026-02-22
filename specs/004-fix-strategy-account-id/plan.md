# Implementation Plan: Fix Strategy Owner Field (accountId → userId)

**Branch**: `004-fix-strategy-account-id` | **Date**: 2026-02-21 | **Spec**: [spec.md](./spec.md)

## Summary

The `Strategy` entity stores the authenticated user's ID in a field named `AccountId`. The name is wrong — strategies are user-scoped, not account-scoped. The fix is a pure rename of `AccountId` → `UserId` across the backend domain, EF Core configuration, database column, and controller, plus a corresponding rename that is already complete on the frontend TypeScript model. No new features, no new endpoints, no new data model additions.

---

## Technical Context

**Language/Version**: C# / .NET 10 (backend) | TypeScript / Angular 21.1 (frontend)  
**Primary Dependencies**: ASP.NET Core, Entity Framework Core 10, PostgreSQL, NgRx SignalStore  
**Storage**: PostgreSQL — column `account_id` on table `strategies.strategies` → rename to `user_id`  
**Testing**: XUnit (backend — no existing test project), Vitest (frontend)  
**Target Platform**: Linux server (API), browser (Angular SPA)  
**Project Type**: Web application (modular monolith backend + Angular frontend)  
**Performance Goals**: No change — rename has zero performance impact  
**Constraints**: EF Core migration must be additive; no data values change, only column name  
**Scale/Scope**: 6 files touched (1 domain, 1 EF config, 1 migration, 1 controller, 1 TS model ✅, 1 snapshot)

---

## Constitution Check

| Principle                                            | Status  | Notes                                                                                                                            |
| ---------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------- |
| I — Nx Monorepo structure                            | ✅ PASS | No library boundaries crossed; changes stay within `libs/strategies` and `Modules/Strategies`                                    |
| II — Angular standards (standalone, signals, OnPush) | ✅ PASS | No Angular component changes; only TS model interface rename (already done)                                                      |
| III — Backend modular monolith                       | ✅ PASS | All changes stay within `Modules/Strategies/`; no cross-module entity references added                                           |
| IV — Zero accessibility                              | ✅ PASS | No UI changes                                                                                                                    |
| V — Testing & quality gates                          | ⚠️ RISK | No existing XUnit test project for backend; unit tests for rename validation should be added (T011, T012 in tasks.md)            |
| VI — Pattern consistency                             | ✅ PASS | Aligns with constitution security standard: "UserId-based filtering on all queries — verify `GetCurrentUserId()` in controllers" |
| VII — Minimal dependencies                           | ✅ PASS | No new dependencies                                                                                                              |

**Gate result**: PROCEED. The only flag (Principle V) is tracked in tasks.md as T011/T012.

---

## Project Structure

### Documentation (this feature)

```text
specs/004-fix-strategy-account-id/
├── plan.md          ← this file
├── research.md      ← Phase 0 output
├── data-model.md    ← Phase 1 output (rename diff, not new model)
├── quickstart.md    ← Phase 1 output
├── contracts/       ← N/A (no API response shape changes)
└── tasks.md         ← already created
```

### Source Code — Files Touched

```text
apps/api/Invenet.Api/
├── Modules/Strategies/
│   ├── Domain/
│   │   └── Strategy.cs                              ← T001: AccountId → UserId property + comment
│   ├── Infrastructure/Data/
│   │   └── StrategyConfiguration.cs                 ← T002: AccountId refs, column name, index names
│   └── API/
│       └── StrategiesController.cs                  ← T004: method rename + all local vars
└── Migrations/
    ├── XXXXXX_RenameStrategyAccountIdToUserId.cs    ← T003: new migration (generated)
    └── ModularDbContextModelSnapshot.cs             ← T009: auto-updated by migration

libs/strategies/src/lib/strategies/data-access/models/
└── strategy.model.ts                                ✅ DONE (T008)
```

**No contracts/ directory needed** — the API response DTOs (`GetStrategyResponse`, `StrategyListItem`, `CreateStrategyResponse`, `UpdateStrategyResponse`) do not expose the owner field. There is no API surface change visible to consumers.

---

## Complexity Tracking

No constitution violations requiring justification. No added complexity.
