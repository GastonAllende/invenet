# AI Context (Minimal)

This is the minimal, single source of truth for LLMs to navigate the repo without fragmenting across many docs.

## What To Open First

- `AGENTS.md` for workflow and constraints
- This file for a fast map of the codebase

## High-Level Map

- Frontend app: `apps/invenet`
- Backend API: `apps/api/Invenet.Api`
- Shared/feature libs: `libs/*`
- Backend modules: `apps/api/Invenet.Api/Modules/*`

## Frontend Conventions

- Angular 21.1 (Nx)
- Use PrimeNG before custom UI
- State management: NgRx SignalStore (`@ngrx/signals`)
- Entry point: `apps/invenet/src/app`

## Backend Conventions

- ASP.NET Core (.NET 10) + EF Core
- Modular Monolith: each module under `apps/api/Invenet.Api/Modules/<ModuleName>`
- API entry: `apps/api/Invenet.Api/Program.cs`

## When Adding/Changing Features

- If a feature spans front + back, update both its library in `libs/*` and its backend module
- Prefer updating the feature's `libs/<feature>/README.md` for local context

## Common Commands (Run From Repo Root)

- Frontend dev server: `npx nx serve invenet`
- Backend dev server: `cd apps/Invenet.Api && dotnet watch run`
- Frontend tests: `npx nx test invenet`
