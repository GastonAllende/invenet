# Implementation Plan: Trade Strategy Association

**Branch**: `001-trade-strategy` | **Date**: February 18, 2026 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-trade-strategy/spec.md`

## Summary

Enable traders to create custom trading strategies and associate them with trades in their journal. The feature provides strategy management (CRUD operations) in the strategies library, strategy selection during trade creation/editing, and filtering capabilities in the trade journal. This supports pattern recognition and performance analysis by strategy type.

## Technical Context

**Frontend Language/Version**: TypeScript 5.x / Angular 21.1  
**Backend Language/Version**: C# / .NET 10  
**Primary Dependencies**:

- Frontend: Angular 21.1, PrimeNG (UI components), NgRx SignalStore (state management), RxJS
- Backend: ASP.NET Core, Entity Framework Core, PostgreSQL provider

**Storage**: PostgreSQL (existing database, new tables/relationships required)  
**Testing**:

- Frontend: Vitest (unit tests), Playwright (E2E)
- Backend: xUnit or NUnit (unit tests), integration tests with test database

**Target Platform**: Web application (browser-based)  
**Project Type**: Web application with separate frontend and backend  
**Performance Goals**:

- Strategy list loading: <500ms for up to 100 strategies per account
- Strategy filter application: <2 seconds for trade journal filtering
- Strategy creation: <200ms database round-trip

**Constraints**:

- Strategy names limited to 200 characters (prevent UI overflow)
- Duplicate strategy names per account not allowed
- Soft delete required for strategies referenced by trades
- Account-scoped data (no cross-account strategy visibility)

**Scale/Scope**:

- Support 100+ custom strategies per account without UI degradation
- Expected average: 3-10 strategies per active trader
- No pagination needed for strategy selection (dropdown/combobox handles 100 items)
- Trade journal filtering must handle thousands of trades efficiently

## Constitution Check

_No project constitution currently defined. Proceeding with standard Nx monorepo and modular monolith best practices._

**Structure Decision**: Web application using Nx monorepo with separate frontend (Angular) and backend (.NET) structure. Frontend uses library-based architecture with strategies in dedicated lib, trades lib extended for strategy integration. Backend follows modular monolith pattern with new Strategies module alongside existing Auth, Trades, Health modules. Both frontend and backend maintain test directories colocated with source code.

### Documentation (this feature)

```text
specs/001-trade-strategy/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── strategies-api.yaml  # OpenAPI spec for strategies endpoints
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (Nx Monorepo Structure)

```text
# Frontend - Angular Libraries (Nx workspace)
libs/strategies/                    # Strategy management library
├── src/
│   ├── index.ts                   # Public API exports
│   └── lib/
│       ├── strategies/            # Feature module
│       │   ├── data-access/      # NgRx SignalStore + API services
│       │   ├── ui/               # PrimeNG-based components
│       │   │   ├── strategy-form/         # Create/edit strategy form
│       │   │   ├── strategy-list/         # List all strategies
│       │   │   └── strategy-selector/     # Strategy dropdown selector (reusable)
│       │   └── feature/          # Smart components & routing
│       │       ├── strategy-shell/        # Feature shell component
│       │       └── strategies-routes.ts   # Route configuration
│       └── test-setup.ts
└── project.json                   # Nx project configuration

libs/trades/                       # Existing trades library (modifications)
├── src/
│   └── lib/
│       └── trades/
│           ├── data-access/      # Add strategy field to trade models/store
│           ├── ui/               # Modify trade form to include strategy selector
│           │   ├── trade-form/            # Add strategy field integration
│           │   └── trade-list/            # Add strategy column & filter
│           └── feature/

# Backend - Modular Monolith (ASP.NET Core)
apps/api/Invenet.Api/Modules/
├── Strategies/                    # NEW: Strategies module
│   ├── StrategiesModule.cs       # Module registration
│   ├── API/
│   │   └── StrategiesController.cs        # REST API endpoints
│   ├── Domain/
│   │   └── Strategy.cs                    # Strategy entity
│   ├── Features/                 # Vertical slices (use cases)
│   │   ├── CreateStrategy/
│   │   │   ├── CreateStrategyRequest.cs
│   │   │   ├── CreateStrategyResponse.cs
│   │   │   └── CreateStrategyHandler.cs
│   │   ├── UpdateStrategy/
│   │   ├── DeleteStrategy/
│   │   ├── GetStrategy/
│   │   └── ListStrategies/
│   └── Infrastructure/
│       └── Data/
│           └── StrategyConfiguration.cs   # EF Core entity configuration
│
└── Trades/                        # Existing trades module (modifications)
    ├── Domain/
    │   └── Trade.cs              # Add StrategyId foreign key property
    ├── Features/                 # Update trade DTOs to include strategy
    └── Infrastructure/
        └── Data/
            └── TradeConfiguration.cs      # Add strategy relationship mapping

# Database Migrations
apps/api/Invenet.Api/Migrations/
└── <timestamp>_AddStrategiesAndTradeStrategyRelation.cs

# Tests
libs/strategies/src/
└── lib/strategies/**/*.spec.ts   # Frontend unit tests (Vitest)

apps/invenet-e2e/src/
└── strategies.spec.ts            # E2E tests (Playwright)

apps/api/Invenet.Test/
├── Modules/
│   └── Strategies/               # Backend unit & integration tests
│       ├── StrategiesControllerTests.cs
│       └── StrategyFeaturesTests.cs
```

**Structure Decision**: Web application using Nx monorepo with separate frontend (Angular) and backend (.NET) structure. Frontend uses library-based architecture with strategies in dedicated lib, trades lib extended for strategy integration. Backend follows modular monolith pattern with new Strategies module alongside existing Auth, Trades, Health modules. Both frontend and backend maintain test directories colocated with source code.

---

_End of Implementation Plan - Proceed to Phase 0 (research.md) for technology-specific implementation details._
