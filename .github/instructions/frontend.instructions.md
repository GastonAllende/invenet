---
description: 'Frontend conventions for the Invenet Angular app. Use when working on Angular components, NgRx SignalStore, services, Nx libs, routing, templates, or Tailwind/PrimeNG styling.'
applyTo: 'apps/invenet/**, libs/**'
---

# Frontend Context

**Stack**: Angular 21+ · Nx monorepo · NgRx SignalStore · PrimeNG · Tailwind CSS

## Library Dependency Rules

```
feature     → data-access, ui, util (same domain) + core
data-access → util (same domain) + core
ui          → util (same domain) + core
util        → nothing
```

Never cross domain boundaries in feature libs.

## Component Conventions

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  // standalone: true is the default — do NOT set it
})
export class MyComponent {
  private store = inject(MyStore); // inject() not constructor DI
}
```

- **OnPush** change detection on every component
- **`inject()`** instead of constructor injection
- **`input()` / `output()`** functions instead of decorators
- **`[class]` / `[style]`** bindings — not `ngClass` / `ngStyle`
- **No arrow functions in templates**
- **`@if`, `@for`, `@switch`** — not `*ngIf`, `*ngFor`

## State Management

Use `signalStore` for shared state. Local state: `signal()` + `computed()`.

```typescript
export const TradesStore = signalStore(
  withState({ trades: [] as Trade[], isLoading: false }),
  withMethods((store, api = inject(TradesApiService)) => ({
    loadTrades: rxMethod<void>(/* ... */),
  })),
);
```

Always use `patchState` for updates — never `.mutate()`.

## Styling

- **PrimeNG first** — check https://primeng.org before writing custom HTML
- **Vanilla CSS or PrimeNG variables** — no Tailwind unless explicitly requested
- No accessibility work unless explicitly requested

## Imports

```typescript
// ✅ Always from the lib's public API
import { TradesStore } from '@invenet/trade/data-access';

// ❌ Never from internal paths
import { TradesStore } from '@invenet/trade/data-access/src/lib/...';
```

## Reference Docs

- Angular patterns & component rules: `docs/frontend/ANGULAR_BEST_PRACTICES.md`
- NgRx SignalStore patterns: `docs/frontend/NGRX_SIGNALSTORE_GUIDE.md`
