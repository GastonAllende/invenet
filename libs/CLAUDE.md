# Frontend Development Guidelines — Angular 21

## Core Principles

- **Component-Driven Development** — build UIs from small, self-contained, reusable components; compose larger features by combining them
- **Composition over inheritance** — assemble behavior from smaller pieces; avoid class hierarchies
- **Single Responsibility** — every function, component, and service does one thing
- **Pure immutable functions** — no side effects, no mutation of inputs
- **Self-documenting code** — meaningful names, logical structure; comments only when "why" isn't obvious

## Complexity Management

- **State**: use Angular Signals + NgRx Signal Store; keep state minimal, derived values via `computed()`
- **Flow control**: prefer declarative RxJS pipelines and `rxMethod`; avoid imperative subscription chains
- **Code volume**: lazy-load features, extract shared logic to services, keep components thin

## Component Architecture

### Container (smart) components

- Routed — each feature route loads a container
- Inject stores/services; expose signals as readonly properties
- Use `effect()` for side effects (toasts, error handling)
- Pass data down via signal-based `input()`, never directly call child methods

### Presentation (dumb) components

- Data in via `input()`, events out via `output()`
- No injected services, no business logic, no server calls, no state management
- `ChangeDetectionStrategy.OnPush` always

### Angular 21 specifics

- **Standalone components only** — no NgModules
- **Zoneless** — `provideExperimentalZonelessChangeDetection()`; rely on Signals for reactivity
- **Signal APIs** — `signal()`, `computed()`, `effect()`, `input()`, `output()`, `linkedSignal()`, `rxResource()`
- **Control flow** — `@if`, `@for`, `@switch` (not `*ngIf`/`*ngFor`)
- **Reactive forms** with `FormBuilder`; sync signal inputs into forms via `effect()`

## Routing & Feature Structure

- Routes describe features: `''` → List, `/new` → Create, `/:id/edit` → Edit, `/:id` → Detail
- Each feature is a lazy-loaded library: `data-access` → `feature` → `ui`
- Shell layout wraps protected routes; `authGuard` applied once at shell level

## Code Quality Rules

- Eliminate hidden state — all dependencies explicit via parameters or injection
- Eliminate nested logic — use early returns, extract methods
- Extract to a method when logic gets complex — the most effective refactoring
- Refactor through promotion, not rewrites
- Don't confuse convention for repetition — structured code has a larger surface area by design
- Consistency over cleverness — favor established patterns over clever idioms
- Follow the style guide unless there's a justified reason not to
- It is impossible to write good tests for bad code

## State Management Pattern

- **NgRx Signal Store** with `signalStore`, `withEntities`, `withState`, `withMethods`; all `providedIn: 'root'`
- Async via `rxMethod` + RxJS; immutable updates via `patchState`; errors stored in state
- **Local state**: `signal()` for UI-only, `computed()` for derived, `effect()` for side effects
- **One-off data**: use `rxResource` instead of a full store

## Data-Access Services

- `providedIn: 'root'`; build URLs from `API_BASE_URL` injection token; return `Observable<T>`
- Status-aware errors: 401 → "Authentication required", 403 → "Permission denied", 404 → "Not found"
- Models: domain entity, filters, create/update request, list response interfaces per feature
- Enums as string unions: `type TradeDirection = 'Long' | 'Short'`

## Styling

- **Tailwind CSS v4** utility classes only — no component CSS, no `styles: [...]`
- Dark mode via `dark:` prefix (`.app-dark` on `<html>`)
- Use `tailwindcss-primeui` design tokens: `bg-surface-card`, `text-color`, `text-muted-color`, `bg-primary`, etc.
- **PrimeNG 21** with Nora theme — import modules individually; use `pButton` directive on `<button>`; `class` for host, `styleClass` for inner element
