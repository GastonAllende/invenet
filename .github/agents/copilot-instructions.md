# invenet Development Guidelines

Manually maintained. Last updated: 2026-02-22

## Technology Stack

### Frontend

| Package                           | Version          |
| --------------------------------- | ---------------- |
| Angular                           | ~21.1.0          |
| @ngrx/signals                     | ^21.0.1          |
| PrimeNG                           | ^21.1.1          |
| tailwindcss + tailwindcss-primeui | ^4.1.13 / ^0.6.1 |
| TypeScript                        | ~5.9.2           |
| Nx                                | 22.4.5           |
| Vitest                            | ^4.0.8           |
| Playwright                        | ^1.36.0          |
| @angular/ssr                      | ~21.1.0          |

### Backend

| Package                                       | Version |
| --------------------------------------------- | ------- |
| .NET / ASP.NET Core                           | 10.0    |
| Entity Framework Core                         | 10.0.2  |
| Npgsql.EntityFrameworkCore.PostgreSQL         | 10.0.0  |
| NSwag.AspNetCore                              | 14.6.3  |
| Microsoft.AspNetCore.Authentication.JwtBearer | 10.0.2  |
| SendGrid                                      | 9.29.3  |

### Database

- PostgreSQL (all persistence)

## Project Structure

```
invenet/                        # Nx workspace root
├── apps/
│   ├── invenet/                # Angular 21 SPA
│   │   └── src/
│   │       ├── app/
│   │       │   ├── pages/      # Route-level pages (login, register, …)
│   │       │   ├── layout/     # Shell layout + services
│   │       │   ├── app.routes.ts
│   │       │   ├── app.config.ts
│   │       │   └── app.ts      # Root component
│   │       └── main.ts
│   ├── invenet-e2e/            # Playwright E2E tests
│   └── api/
│       └── Invenet.Api/        # ASP.NET Core 10 modular-monolith API
│           └── Modules/
│               ├── Accounts/
│               ├── Auth/
│               ├── Shared/
│               ├── Strategies/
│               └── Trades/
│
├── libs/                       # Domain-driven Nx libraries
│   ├── accounts/               # Brokerage accounts feature
│   ├── analytics/              # Analytics feature
│   ├── auth/                   # Authentication (guards, interceptors)
│   ├── core/                   # Shared infrastructure / utilities
│   ├── dashboard/              # Dashboard feature
│   ├── strategies/             # Trading strategies feature
│   └── trades/                 # Trade journal feature
│
├── specs/                      # Feature specs (spec.md / plan.md / tasks.md)
│   ├── 001-trade-strategy/
│   ├── 002-brokerage-accounts/
│   ├── 003-align-accounts-design/
│   └── 004-fix-strategy-account-id/
├── docs/                       # Agent guides and best practices
├── nx.json
├── package.json
└── tsconfig.base.json
```

Each domain library follows a 4-layer pattern: `feature` → `data-access` → `ui` → `util`.  
See [docs/ANGULAR_BEST_PRACTICES.md](../../docs/ANGULAR_BEST_PRACTICES.md) for full structure rules.

## Commands

```bash
# Install dependencies
npm install
dotnet restore && dotnet tool restore

# Run frontend dev server
npx nx serve invenet

# Run backend dev server
cd apps/api/Invenet.Api && dotnet watch run

# Build (production)
npx nx build invenet --configuration=production

# Unit tests
npx nx test invenet               # all frontend tests
npx nx test <lib-name>            # single lib (e.g. npx nx test accounts)
cd apps/api && dotnet test        # backend tests

# Lint
npx nx lint invenet

# E2E
npx nx e2e invenet-e2e
npx playwright install            # install browsers if missing

# Nx utilities
npx nx reset                      # clear Nx cache
npx nx affected --target=test     # run tests only on affected projects
```

## Key Entry Points

| Area                   | Path                                   |
| ---------------------- | -------------------------------------- |
| Frontend entry         | `apps/invenet/src/main.ts`             |
| Root component         | `apps/invenet/src/app/app.ts`          |
| App config             | `apps/invenet/src/app/app.config.ts`   |
| Routes                 | `apps/invenet/src/app/app.routes.ts`   |
| API entry              | `apps/api/Invenet.Api/Program.cs`      |
| API modules            | `apps/api/Invenet.Api/Modules/*`       |
| API controllers        | `apps/api/Invenet.Api/Modules/*/API/*` |
| Modular monolith guide | `apps/api/MODULAR_MONOLITH.md`         |

## Code Style

### Angular / Frontend

- **Standalone components only** — no NgModules.
- **Modern control flow** — use `@if`, `@for`, `@switch` in templates (not `*ngIf`, `*ngFor`).
- **Signals + NgRx SignalStore** for all state; avoid `BehaviorSubject` patterns.
- **Smart/dumb split**: smart (container) components live in `feature`, dumb (presentational) in `ui`.
- **`inject()` function** for DI — not constructor injection.
- **Typed reactive forms** — `FormGroup<T>`, never untyped forms.
- **No accessibility** additions — deliberately omitted in this project.
- Follow [docs/ANGULAR_BEST_PRACTICES.md](../../docs/ANGULAR_BEST_PRACTICES.md) for full rules.
- Follow [docs/CODE_REVIEW_CHECKLIST.md](../../docs/CODE_REVIEW_CHECKLIST.md) before opening PRs.

### Backend

- Modular-monolith architecture — see `apps/api/MODULAR_MONOLITH.md`.
- Feature-slice folder layout per module: `API/`, `Application/`, `Domain/`, `Infrastructure/`.
- EF Core migrations scoped per module (not a single global context).

## Implemented Features

| ID  | Branch                        | Status      | Summary                                                                                 |
| --- | ----------------------------- | ----------- | --------------------------------------------------------------------------------------- |
| 001 | `001-trade-strategy`          | Implemented | Trading strategy CRUD + assignment to trades (strategies lib + Strategies module)       |
| 002 | `002-brokerage-accounts`      | Implemented | Brokerage account CRUD with risk settings (accounts lib + Accounts module)              |
| 003 | `003-align-accounts-design`   | Implemented | Accounts UI refactored to modal pattern, delete functionality added                     |
| 004 | `004-fix-strategy-account-id` | Implemented | Renamed `accountId` → `userId` on `strategies.strategies` table (data model correction) |

## Recent Changes
- 005-trades-data-refactor: Added PostgreSQL — `trades` schema, `trades` table. EF Core migrations via `dotnet ef migrations add`

- **004-fix-strategy-account-id**: Renamed `account_id` column → `user_id` on `strategies.strategies` table; updated `Strategy` EF entity, TypeScript model, and all repository queries. No API response shape changes.
- **003-align-accounts-design**: Refactored accounts page to use PrimeNG modal for create/edit (matching strategies pattern); added delete account functionality.

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

## Active Technologies
- PostgreSQL — `trades` schema, `trades` table. EF Core migrations via `dotnet ef migrations add` (005-trades-data-refactor)
