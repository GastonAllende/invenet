# Implementation Plan: Brokerage Account Management

**Branch**: `002-brokerage-accounts` | **Date**: 20 February 2026 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-brokerage-accounts/spec.md`

## Summary

Implement full CRUD functionality for brokerage account management with embedded risk settings. Traders can create, view, edit, and archive accounts with validation for immutable fields (StartDate, StartingBalance) and risk percentages (0-100 range). Architecture mirrors existing Strategies module using Modular Monolith pattern with separate tables for Account (11 fields) and AccountRiskSettings (7 fields) in 1:1 relationship. Backend uses .NET 10 + EF Core + PostgreSQL with lowercase table/index naming. Frontend uses Angular 21.1 + NgRx SignalStore + PrimeNG with libs/accounts split (data-access, ui, feature). Key technical decisions: embedded risk settings in API responses (not separate endpoints), predefined broker/timezone/currency lists, real-time validation with 300ms debounce, explicit schema "accounts" for all tables.

## Technical Context

**Language/Version**: .NET 10 (backend), TypeScript 5.x (frontend)  
**Primary Dependencies**: ASP.NET Core 10, Entity Framework Core 10.0.2, Angular 21.1, PrimeNG 21.1.1, NgRx SignalStore (@ngrx/signals)  
**Storage**: PostgreSQL (existing database, new schema "accounts" with 2 tables)  
**Testing**: xUnit (backend), Vitest (frontend unit), Playwright (E2E)  
**Target Platform**: Web application (SPA + REST API)  
**Project Type**: Web application (monorepo with Nx workspace)
**Performance Goals**: API response time <500ms for CRUD operations, frontend validation debounce 300ms, database queries use composite indexes for user-scoped filtering  
**Constraints**: Must mirror Strategies module patterns (100% alignment), lowercase table/index naming, explicit schema declaration, immutable StartDate/StartingBalance fields, decimal precision (18,2 for currency, 5,2 for percentages)  
**Scale/Scope**: 4 user stories, 79 implementation tasks, 5 REST endpoints, 2 database tables, 3 frontend libraries (data-access, ui, feature), estimated 2-3 weeks development time

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Initial Check (before Phase 0)**: PASS  
**Re-evaluation (after Phase 1)**: PASS

**Status**: No constitution violations. Constitution file (`.specify/memory/constitution.md`) exists as template only - no actual rules defined.

**Phase 0 to Phase 1 Changes**:

- No new technologies introduced (all tech from research.md)
- No architectural changes that would violate typical principles
- Design artifacts (data-model.md, contracts/, quickstart.md) completed
- All design decisions documented in research.md with rationale

**Conclusion**: Feature design adheres to existing project patterns (mirrors 001-trade-strategy module). No constitution defined = no violations possible.

## Project Structure

### Documentation (this feature)

```text
specs/002-brokerage-accounts/
├── spec.md              # Feature specification (this was filled by analysis remediation)
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 output (10 technical decisions)
├── data-model.md        # Phase 1 output (ERD, entities, migrations)
├── quickstart.md        # Phase 1 output (developer guide)
├── pattern-alignment.md # Pattern comparison with Strategies module
├── contracts/
│   └── AccountsOpenAPI.yaml  # REST API specification (5 endpoints)
└── tasks.md             # Phase 2 output (79 tasks in 7 phases)
```

### Source Code (Backend)

```text
apps/Invenet.Api/
├── Modules/
│   └── Accounts/
│       ├── API/
│       │   └── AccountsController.cs       # 5 endpoints (GET, GET/{id}, POST, PUT, POST/{id}/archive)
│       ├── Domain/
│       │   ├── Account.cs                  # Entity (11 fields + navigation)
│       │   ├── AccountRiskSettings.cs      # Entity (7 fields + navigation)
│       │   └── DTOs/
│       │       ├── CreateAccountRequest.cs
│       │       ├── CreateAccountResponse.cs
│       │       ├── UpdateAccountRequest.cs
│       │       ├── UpdateAccountResponse.cs
│       │       ├── GetAccountResponse.cs
│       │       ├── ListAccountsResponse.cs
│       │       ├── AccountRiskSettingsResponse.cs
│       │       └── RiskSettingsDto.cs
│       └── Infrastructure/
│           └── Data/
│               ├── AccountConfiguration.cs  # EF Core config (indexes, schema)
│               └── AccountRiskSettingsConfiguration.cs
└── Migrations/
    └── YYYYMMDDHHMMSS_AddAccountsModule.cs  # Generated migration
```

### Source Code (Frontend)

```text
libs/accounts/
├── data-access/
│   └── src/
│       ├── lib/
│       │   ├── accounts.service.ts         # HTTP client (5 API calls)
│       │   ├── accounts.store.ts           # NgRx SignalStore (state + rxMethods)
│       │   └── models/
│       │       ├── account.model.ts
│       │       ├── create-account-request.model.ts
│       │       └── update-account-request.model.ts
│       └── index.ts
├── ui/
│   └── src/
│       ├── lib/
│       │   ├── account-form/
│       │   │   ├── account-form.component.ts
│       │   │   ├── account-form.component.html  # Reactive form with PrimeNG
│       │   │   └── account-form.component.css
│       │   ├── account-list/
│       │   │   ├── account-list.component.ts
│       │   │   ├── account-list.component.html  # PrimeNG Table
│       │   │   └── account-list.component.css
│       │   └── index.ts
│       └── index.ts
└── feature/
    └── src/
        ├── lib/
        │   ├── accounts-shell/
        │   │   ├── accounts-shell.component.ts      # Smart component
        │   │   └── accounts-shell.component.html
        │   └── routes.ts                            # Lazy loaded route
        └── index.ts

apps/invenet/src/app/
├── app.routes.ts        # Updated: add path 'accounts', loadChildren accountsRoutes
└── app.component.html   # Updated: add "Accounts" navigation menu item
```

**Structure Decision**: Selected Web Application structure (Option 2) with Modular Monolith pattern on backend and library-based feature modules on frontend. Backend follows existing pattern in `apps/Invenet.Api/Modules/Strategies/` with Infrastructure/Data folder (not Infrastructure/Configuration). Frontend mirrors `libs/strategies/` split into data-access (service + store), ui (presentational components), and feature (smart components + routing).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
