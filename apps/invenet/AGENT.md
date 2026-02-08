# Invenet Frontend - Agent Instructions

## Stack
- Angular 21.1 (standalone components)
- PrimeNG UI
- NgRx SignalStore (`@ngrx/signals`)
- Vitest unit tests
- Playwright E2E tests

## Entry Points
- `apps/invenet/src/main.ts`
- `apps/invenet/src/app/app.ts`
- `apps/invenet/src/app/app.config.ts`
- `apps/invenet/src/app/app.routes.ts`

## Common Commands
```bash
# Dev server
npx nx serve invenet

# Build
npx nx build invenet --configuration=production

# Unit tests
npx nx test invenet

# Lint
npx nx lint invenet
```

## Notes
- Prefer PrimeNG components before custom UI.
- Use SignalStore for shared state and signals for local state.
- Follow `docs/AGENT_PLAYBOOK.md` for patterns.
