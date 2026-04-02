# Invenet

## Repo Map

| Area            | Path                            |
| --------------- | ------------------------------- |
| Frontend app    | `apps/invenet/src/app`          |
| Frontend libs   | `libs/`                         |
| Backend API     | `apps/api/Invenet.Api`          |
| Backend modules | `apps/api/Invenet.Api/Modules/` |

## Context Instructions (auto-loaded by file)

Detailed conventions are split by concern and load automatically when you open matching files:

| Working on…  | Instruction file                                | Loads when editing…          |
| ------------ | ----------------------------------------------- | ---------------------------- |
| **Frontend** | `.github/instructions/frontend.instructions.md` | `apps/invenet/**`, `libs/**` |
| **Backend**  | `.github/instructions/backend.instructions.md`  | `apps/api/**`                |

Open the relevant instruction file manually if you need context without having a matching file open.

## Feature Cross-Reference

| Feature    | Frontend lib     | Backend module       |
| ---------- | ---------------- | -------------------- |
| Auth       | `libs/auth`      | `Modules/Auth`       |
| Accounts   | `libs/account`   | `Modules/Accounts`   |
| Trades     | `libs/trade`     | `Modules/Trades`     |
| Strategies | `libs/strategy`  | `Modules/Strategies` |
| Analytics  | `libs/analytics` | `Modules/Trades`     |

## Dev Commands

```bash
# Both frontend + backend
npm run dev

# Frontend only
npx nx serve invenet

# Backend only
cd apps/api/Invenet.Api && dotnet watch run

# Tests
npx nx test invenet
cd apps/api && dotnet test

# E2E
npx nx e2e invenet-e2e
```

## Workflow Rules

- Run Nx commands from repo root
- Keep changes scoped and minimal
- No accessibility work unless explicitly requested
- PrimeNG before custom UI; vanilla CSS or PrimeNG variables (no Tailwind unless asked)

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->
