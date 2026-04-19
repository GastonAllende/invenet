# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Invenet is a trading journal application — an **Nx monorepo** with an **Angular 21 frontend** and a **.NET 10 backend API**.

## Commands

```bash
# Development
npm run dev          # Run frontend (port 4200) and API (port 5256) in parallel
npm run web          # Frontend only
npm run api          # API only

# Testing
npm test             # Run all tests
npm run test-affected  # Test only affected projects

# Lint + test + build (CI)
npm run lint-test-build

# Nx utilities
npx nx graph                    # Visualize project dependency graph
npx nx show project <name>      # List all targets for a project
```

For the .NET API, use `dotnet` commands from `apps/api/Invenet.Api/`:

```bash
dotnet ef migrations add <Name>   # Add EF Core migration
dotnet ef database update         # Apply migrations
```

## Architecture

### Monorepo Layout

```
apps/
  invenet/           # Angular SPA
  api/Invenet.Api/   # ASP.NET Core 10 API
  invenet-e2e/       # Playwright E2E tests
libs/
  core/              # API_BASE_URL injection token
  auth/              # Auth feature (data-access + feature)
  trade/             # Trades (data-access + feature + ui)
  strategy/          # Strategies (data-access + feature + ui)
  account/           # Accounts (data-access + feature + ui)
  dashboard/         # Dashboard (feature + ui)
  shared/
    util-auth/       # authGuard, authInterceptor, token helpers
    feature-shell/   # Root layout + route composition
    ui-layout/       # Shared layout components
```

### Frontend (Angular 21)

- **Standalone components** — no NgModules
- **Zoneless change detection** — uses Angular Signals + `provideExperimentalZonelessChangeDetection()`
- **Lazy-loaded routes** — each feature loaded via `loadChildren`; all protected routes guarded by `authGuard`
- **Library layers** per feature: `data-access` (services + models) → `feature` (pages + routes) → `ui` (reusable components)
- **Imports** use `@invenet/*` path aliases defined in `tsconfig.base.json`

#### State Management

- **NgRx Signal Store** — primary state pattern; stores use `signalStore` with `withEntities`, `withState`, `withMethods`; all `providedIn: 'root'`
- **Async operations** via `rxMethod` with RxJS pipelines; immutable updates via `patchState`; errors stored in state (not thrown)
- **Local component state** — `signal()` for UI-only values, `computed()` for derived values, `effect()` for side effects
- **One-off data loads** — use `rxResource` instead of a full store when data is fetched once and not shared

#### Data-Access Services

- **API services** — `providedIn: 'root'`; build base URL from `API_BASE_URL` injection token; return `Observable<T>`
- **Error messages** are status-aware: 401 → "Authentication required", 403 → "Permission denied", 404 → "Not found"
- Each feature library exports its store, API service, and models from a barrel `index.ts`

#### Feature Route Conventions

- Standard CRUD route pattern per feature: `''` → List, `/new` → Create, `/:id/edit` → Edit, `/:id` → Detail
- Shell layout component wraps all protected feature routes; `authGuard` applied once at the shell level

#### Component Patterns

- **Feature pages** (smart) — inject stores and services; expose store signals as readonly component properties; use `effect()` to watch `store.error()` → show toast via `MessageService` → clear error; call store methods in response to UI events
- **UI components** (presentational) — data in via `input()`, events out via `output()`; no service injection; all use `ChangeDetectionStrategy.OnPush`

#### Form Patterns

- **Reactive forms** via `FormBuilder`; use `effect()` to sync signal inputs into form state (e.g., populate form on edit)
- **Dynamic validators** applied via `effect()` watching dependent control values
- Emit form value via `output()` using `getRawValue()`; forms accept a `mode` input (`'create' | 'edit'`) to control behavior

#### Model Organization

- Each feature defines: domain entity interface, filters interface, create/update request interfaces, and list response interface
- Enums are string union types (e.g., `type TradeDirection = 'Long' | 'Short'`)
- All types exported from the data-access barrel `index.ts`

### Backend (.NET 10 — Modular Monolith)

- **Database**: PostgreSQL via Npgsql + EF Core 10; connection string in user-secrets
- **IModule pattern** — each domain module implements `IModule` (`RegisterModule` + `MapEndpoints`); auto-discovered via reflection in `ModuleExtensions`
- **Single `ModularDbContext`** — no typed `DbSet<>` properties; access entities via `_context.Set<T>()`; entity configurations use `IEntityTypeConfiguration<T>` per module
- **`ApiControllerBase`** — shared base for controllers; provides `TryGetCurrentUserId(out Guid)` helper
- **`BaseEntity`** — base class with `Id`, `CreatedAt`, `UpdatedAt`
- **Identity**: ASP.NET Core Identity with `ApplicationUser : IdentityUser<Guid>`; JWT Bearer auth
- **Email**: SendGrid via `EmailService`; HTML templates in `EmailTemplates/`
- **OpenAPI**: NSwag — Swagger UI available in development at `/swagger`
- **Rate limiting** — auth endpoints: 10 req/min per IP; global: 300 req/min per user or IP

#### Module Structure

Each module under `Modules/` follows this layout:

```
Modules/<Name>/
  <Name>Module.cs          # IModule implementation
  API/                     # Controllers (extend ApiControllerBase)
  Domain/                  # Entities and enums
  Features/                # DTOs and request/response models
  Infrastructure/Data/     # IEntityTypeConfiguration<T> classes
```

#### Conventions

- All controllers use `[Authorize]` except Auth endpoints
- Auth controller uses `[EnableRateLimiting("auth")]`
- Route prefix: `api/<module>` (e.g., `api/trades`, `api/auth`)
- Controllers verify resource ownership before any operation

### Auth Flow

1. `POST /api/auth/login` → returns `{ accessToken, refreshToken }`
2. `AuthService` stores tokens in `localStorage`
3. `authInterceptor` attaches `Authorization: Bearer <token>` to every request
4. On 401, interceptor auto-refreshes via `POST /api/auth/refresh`, then retries the original request
5. Proactive refresh triggers 2 minutes before token expiry

### Key Configuration

- Backend secrets (DB connection string, JWT key, SendGrid) are managed via `dotnet user-secrets` — **not** committed; see `.env.example` for required keys
- CORS origin is configured in `appsettings.json`
- Frontend points to the API via the `API_BASE_URL` injection token, set in `app.config.ts`

### Styling — Tailwind CSS v4

- **Only Tailwind utility classes** in templates — no component CSS, no `styles: [...]` blocks
- Entry point: `apps/invenet/src/tailwind.css` (`@import 'tailwindcss'` + `@plugin 'tailwindcss-primeui'`)
- Dark mode: `dark:` prefix, triggered by `.app-dark` on `<html>`
- Use `tailwindcss-primeui` tokens instead of hardcoded colors: `bg-surface-card`, `bg-surface-50`, `border-surface-border`, `text-color`, `text-muted-color`, `text-primary-color`, `bg-primary`

### PrimeNG

- **Version**: `primeng@^21`, theme: `Nora` preset (`@primeuix/themes@^2`), dark mode selector: `.app-dark`
- Import modules individually (`CardModule`, `ButtonModule`, etc.) — no barrel imports
- `class=""` targets the host element; `styleClass=""` targets the inner PrimeNG div — prefer `class` for layout
- Use `pButton` directive on `<button>`, not `<p-button>` component
- Notifications: `p-toast` + `MessageService` (add to `providers:`); confirmations: `p-confirmDialog` + `ConfirmationService`

### Testing

- **Unit tests**: Vitest 4.0 + Analog testing utilities (Angular)
- **E2E**: Playwright (`apps/invenet-e2e/`)
