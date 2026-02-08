# Invenet - Agent Playbook

## Scope
This playbook contains conventions and best practices for working in this repo. It complements `AGENT.md` and should be used when making design or implementation decisions.

## Angular (v21.1)
- Prefer standalone components and functional providers.
- Prefer `inject()` over constructor DI in components/services.
- Prefer signals for local state and SignalStore for shared state.
- Keep templates simple and move logic to TypeScript.
- Avoid editing generated files.

## Angular AI Prompt (Official)
You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

### TypeScript Best Practices
- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

### Angular Best Practices
- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

### Accessibility Requirements
- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components
- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

### State Management
- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

### Templates
- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.
- Do not write arrow functions in templates (they are not supported).

### Services
- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

Source: https://angular.dev/ai/develop-with-ai

## PrimeNG
- Use PrimeNG components for UI elements before building custom ones.
- Keep theme usage consistent with existing styles.
- Prefer PrimeIcons for iconography when needed.

## State Management (NgRx SignalStore)
- Use `signalStore` for shared state; avoid NgRx classic store unless existing code already uses it.
- Use `withState`, `withComputed`, and `withMethods` patterns.
- Use `patchState` for updates; keep updates immutable.
- Prefer `rxMethod` for async workflows when using RxJS.

## Unit Tests (Vitest)
- Place tests next to the unit under test when possible.
- Prefer testing observable behavior via public APIs.
- Avoid brittle DOM selectors; use role and text where possible.
- Run with:
  ```bash
  npx nx test invenet
  ```

## E2E Tests (Playwright)
- Use page objects and shared helpers where available.
- Prefer stable selectors (data-test or role based).
- Keep tests independent and deterministic.
- Run with:
  ```bash
  npx nx e2e invenet-e2e
  ```

## Backend (.NET)
- Prefer async APIs and `ActionResult<T>` patterns.
- Keep controllers thin and push logic into services.
- Use EF Core `AsNoTracking()` for read-only queries.
- Validate inputs and return proper status codes.

## Logging and Errors
- Use structured logging in the API.
- Prefer user-friendly error messages in the UI.
- Avoid leaking secrets in logs.
