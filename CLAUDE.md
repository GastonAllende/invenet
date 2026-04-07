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

### Backend (.NET 10 — Modular Monolith)

- **IModule pattern** — each domain (Auth, Trades, Strategies, Accounts) implements `IModule`, which registers its own services, DbContext, and maps endpoints
- **Single `ModularDbContext`** — all entity configurations live in one EF Core context
- **`ApiControllerBase`** — shared base class for all controllers (common response helpers)
- **Rate limiting** — auth endpoints: 10 req/min per IP; global: 300 req/min per user or IP

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
