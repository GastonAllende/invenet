# Invenet - Agent Instructions

## Purpose & Audience

This file is for AI coding agents. Prioritize actionable commands, repo-specific workflow, and minimal necessary context.

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

## Core Stack (Short)

- Frontend: Angular 21.1 (Nx workspace)
- UI library: PrimeNG
- State management: NgRx SignalStore (`@ngrx/signals`)
- Backend: ASP.NET Core (.NET) + Entity Framework Core
- Database: PostgreSQL

## Common Tasks

```bash
# Frontend
npx nx build invenet --configuration=production
npx nx test invenet
npx nx lint invenet

# Backend
cd apps/Invenet.Api
 dotnet test

# E2E
npx nx e2e invenet-e2e
# Install browsers if missing
npx playwright install
```

## Key Entry Points

| Area            | Path                               |
| --------------- | ---------------------------------- |
| Frontend entry  | apps/invenet/src/main.ts           |
| Root component  | apps/invenet/src/app/app.ts        |
| App config      | apps/invenet/src/app/app.config.ts |
| Routes          | apps/invenet/src/app/app.routes.ts |
| API entry       | apps/Invenet.Api/Program.cs        |
| API controllers | apps/Invenet.Api/Controllers/\*    |

## Workflow & Constraints

- Run Nx commands from repo root.
- Keep changes scoped and minimal.
- Avoid editing generated files.
- Run tests relevant to the change only.

## CI Reference

- Frontend: lint, test, build (Nx)
- Backend: `dotnet restore`, `dotnet build`, `dotnet test`
- E2E: `npx nx e2e invenet-e2e`

## Troubleshooting (Top 5)

- DB connection: verify PostgreSQL running and connection string in `apps/Invenet.Api/appsettings*.json` or user secrets.
- CORS errors: check CORS policy in `apps/Invenet.Api/Program.cs`.
- JWT/token errors: confirm auth interceptor and token expiry.
- Nx cache issues: run `npx nx reset`.
- Playwright browsers missing: run `npx playwright install`.

## Additional Agent Files

- Frontend-specific: `apps/invenet/AGENT.md`
- Backend-specific: `apps/Invenet.Api/AGENT.md`
- Best practices: `docs/AGENT_PLAYBOOK.md`
- Official Angular AI prompt: `docs/AGENT_PLAYBOOK.md` (Angular AI Prompt section)

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
