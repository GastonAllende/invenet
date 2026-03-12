# Invenet - Agent Instructions

## Purpose & Audience

This file is for AI coding agents. Prioritize actionable commands, repo-specific workflow, and minimal necessary context.

## LLM Context (Quick Map)

- Frontend app: `apps/invenet`
- Backend API: `apps/api/Invenet.Api`
- Features live in `libs/*` (each feature should have a `README.md`)
- Backend modules live in `apps/api/Invenet.Api/Modules/*`

### Cross-Project Mapping

When working on a feature, you usually need to touch both:
| Feature | Frontend Lib | Backend Module |
| :--- | :--- | :--- |
| **Auth** | `libs/auth` | `Modules/Auth` |
| **Accounts** | `libs/accounts` | `Modules/Accounts` |
| **Trades** | `libs/trades` | `Modules/Trades` |
| **Strategies**| `libs/strategies` | `Modules/Strategies` |
| **Analytics** | `libs/analytics` | `Modules/Trades` (usually) |

## Quick Start

```bash
# Node + frontend deps
npm install

# .NET deps + tools
 dotnet restore
 dotnet tool restore

# Frontend dev server
npx nx serve invenet

# Backend dev server
cd apps/Invenet.Api
 dotnet watch run
```

## Core Stack

### Frontend
- **Angular 21.1** (Nx monorepo workspace)
- **PrimeNG** - UI component library (always check PrimeNG before building custom UI)
- **NgRx SignalStore** (`@ngrx/signals`) - State management
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **Tailwind CSS** - Styling

### Backend
- **ASP.NET Core (.NET 10)** + Entity Framework Core
- **Modular Monolith Architecture** (see `docs/backend/MODULAR_MONOLITH.md`)
- **PostgreSQL** - Database
- **JWT Authentication** - Token-based auth
- **Swagger/OpenAPI** - API documentation
- **Modules**: Auth, Trades, Accounts, Health, Shared (auto-discovered at startup)

## Libraries (Nx Domain-Driven Design)

The project uses **feature-sliced libraries** under `libs/`. Each domain has 4 library types:

### Library Types

| Type | Purpose | Can Depend On |
|------|---------|---------------|
| **feature** | Routed pages, smart/container components | data-access, ui, util (same domain) + core |
| **data-access** | SignalStores, API services, repositories | util (same domain) + core |
| **ui** | Presentational/dumb components | util (same domain) + core |
| **util** | Pure helper functions, pipes, validators | Nothing (pure utilities) |

**Key Rule**: No cross-domain feature dependencies (e.g., `trades-feature` → `dashboard-feature`)

### Working with Libraries

- **To understand a feature**: Look at its `README.md` (e.g., `libs/trade/README.md`)
- **Backend**: Corresponding modules are in `apps/api/Invenet.Api/Modules/<ModuleName>/`
- **Import from library's public API**: `import { TradeStore } from '@invenet/trade/data-access';`
- **Never import from internal paths**: Don't use `src/lib/` in imports

## Common Commands

### Development (Run from Repo Root)

```bash
# Run both frontend and backend
npm run dev

# Frontend only
npx nx serve invenet

# Backend only
cd apps/api/Invenet.Api
dotnet watch run
```

### Frontend (Nx Commands)

```bash
npx nx serve invenet                    # Dev server
npx nx build invenet --configuration=production  # Production build
npx nx test invenet                     # Unit tests (Vitest)
npx nx lint invenet                     # Linting
npx nx e2e invenet-e2e                  # E2E tests (Playwright)

# Affected commands (only changed code)
npx nx affected:test
npx nx affected:build
npx nx affected:lint

# Visualize project dependencies
npx nx graph
```

### Backend (.NET Commands)

```bash
# From apps/api/Invenet.Api/
dotnet watch run              # Dev with hot reload
dotnet test                   # Run tests
dotnet ef database update     # Apply migrations
dotnet ef migrations add <name>  # Create migration
```

### Playwright

```bash
# Install browsers if missing
npx playwright install
```

## Key Entry Points

| Area           | Path                              |
| -------------- | --------------------------------- |
| Frontend Shell | `apps/invenet/src/app`            |
| Features/Deps  | `libs/*`                          |
| API Core       | `apps/api/Invenet.Api/Program.cs` |
| API Modules    | `apps/api/Invenet.Api/Modules/*`  |

## Workflow & Constraints

- Run Nx commands from repo root
- Keep changes scoped and minimal
- Avoid editing generated files
- Run tests relevant to the change only

## Critical Conventions

### Frontend
- **Standalone components only** - No NgModules (default in Angular 20+)
- **Use `inject()` instead of constructor DI** - `private service = inject(Service)`
- **Signals for state** - Use `signal()`, `computed()` for local state, SignalStore for shared
- **Native control flow** - Use `@if`, `@for` NOT `*ngIf`, `*ngFor`
- **OnPush change detection** - Set on all components
- **Class/style bindings** - Use `[class]` and `[style]`, NOT `ngClass`/`ngStyle`
- **No arrow functions in templates** - Not supported by Angular

### Backend
- **Modules are self-contained** - No direct module-to-module references
- **Use `AsNoTracking()`** - For read-only queries
- **Vertical slice organization** - Features organized by use case (e.g., `Register/`, `Login/`)
- **Schema per module** - Each module uses its own database schema

## CI Reference

- Frontend: lint, test, build (Nx)
- Backend: `dotnet restore`, `dotnet build`, `dotnet test`
- E2E: `npx nx e2e invenet-e2e`

## Configuration

- **JWT, Database, SendGrid**: `apps/api/Invenet.Api/appsettings*.json` or user secrets
- **Frontend environments**: `apps/invenet/src/environments/`
- **Nx config**: `nx.json`

## Troubleshooting (Top 5)

- DB connection: verify PostgreSQL running and connection string in `apps/Invenet.Api/appsettings*.json` or user secrets.
- CORS errors: check CORS policy in `apps/Invenet.Api/Program.cs`.
- JWT/token errors: confirm auth interceptor and token expiry.
- Nx cache issues: run `npx nx reset`.
- Playwright browsers missing: run `npx playwright install`.

## Additional Documentation

- Minimal LLM context: `docs/AI_CONTEXT.md`
- Best practices & Playbook: `docs/AGENT_PLAYBOOK.md`
- Backend architecture: `docs/backend/MODULAR_MONOLITH.md`
- Module template: `docs/backend/MODULE_TEMPLATE.md`
- Angular best practices: `docs/ANGULAR_BEST_PRACTICES.md`
- NgRx SignalStore guide: `docs/NGRX_SIGNALSTORE_GUIDE.md`
- Dependency updates: `docs/DEPENDENCY_UPDATE_GUIDE.md`

## Accessibility & Styling

- **No Accessibility**: This project deliberately ignores accessibility. Do not add ARIA roles, AXE fixes, or focus management unless explicitly requested by the user.
- **Vanilla CSS**: Use Vanilla CSS or PrimeNG variables. Do not introduce Tailwind unless specifically requested for a new component.
- **PrimeNG First**: Always check for a [PrimeNG](https://primeng.org/) component before writing custom HTML/CSS.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.

<!-- nx configuration end-->
