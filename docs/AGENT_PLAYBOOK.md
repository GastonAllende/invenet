# Invenet - Agent Playbook

## Scope

This playbook contains conventions and best practices for working in this repo. It complements `AGENT.md` and should be used when making design or implementation decisions.

## Angular (v21.1)

**For comprehensive Angular patterns and best practices, see [ANGULAR_BEST_PRACTICES.md](ANGULAR_BEST_PRACTICES.md).**

Quick reference:

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

### Core Principles

- Use `signalStore` for shared state; avoid NgRx classic store unless existing code already uses it.
- Provide stores at component level when possible for better encapsulation
- Keep state updates immutable using `patchState`
- Use dependency injection with `inject()` function

### Store Creation Patterns

**Basic Store Structure:**

```typescript
import { signalStore, withState, withComputed, withMethods } from '@ngrx/signals';

export const CounterStore = signalStore(
  withState({ count: 0 }),
  withComputed(({ count }) => ({
    doubleCount: computed(() => count() * 2),
  })),
  withMethods((store) => ({
    increment(): void {
      patchState(store, { count: store.count() + 1 });
    },
  })),
);
```

**Provide in Component:**

```typescript
@Component({
  providers: [CounterStore],
  template: `<p>Count: {{ store.count() }}</p>`,
})
export class Counter {
  readonly store = inject(CounterStore);
}
```

### State Updates

**Use patchState for updates:**

```typescript
// Direct value
patchState(store, { count: 10 });

// Function updater
patchState(store, (state) => ({ count: state.count + 1 }));
```

**Never use `mutate` - use `update` or `set` instead:**

```typescript
// ❌ Don't do this
signal.mutate((value) => value.count++);

// ✅ Do this
signal.update((value) => ({ ...value, count: value.count + 1 }));
signal.set({ count: 10 });
```

### Computed State

Use `withComputed` for derived state:

```typescript
export const UserStore = signalStore(
  withState({ firstName: '', lastName: '' }),
  withComputed(({ firstName, lastName }) => ({
    fullName: computed(() => `${firstName()} ${lastName()}`),
  })),
);
```

### Async Operations with rxMethod

**For RxJS-based workflows:**

```typescript
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';

export const BooksStore = signalStore(
  withState({ books: [], isLoading: false }),
  withMethods((store, booksService = inject(BooksService)) => ({
    loadBooks: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() =>
          booksService.getBooks().pipe(
            tapResponse({
              next: (books) => patchState(store, { books, isLoading: false }),
              error: (error) => {
                console.error(error);
                patchState(store, { isLoading: false });
              },
            }),
          ),
        ),
      ),
    ),
  })),
);
```

### Entity Management

**For managing collections with IDs:**

```typescript
import { signalStore } from '@ngrx/signals';
import { withEntities, addEntity, removeEntity, updateEntity } from '@ngrx/signals/entities';

type Todo = { id: number; text: string; completed: boolean };

export const TodosStore = signalStore(
  withEntities<Todo>(),
  withMethods((store) => ({
    addTodo(todo: Todo): void {
      patchState(store, addEntity(todo));
    },
    removeTodo(id: number): void {
      patchState(store, removeEntity(id));
    },
    toggleTodo(id: number): void {
      patchState(
        store,
        updateEntity({
          id,
          changes: (todo) => ({ completed: !todo.completed }),
        }),
      );
    },
  })),
);
```

**Named collections for multiple entity types:**

```typescript
export const LibraryStore = signalStore(
  withEntities({ entity: type<Book>(), collection: 'book' }),
  withEntities({ entity: type<Author>(), collection: 'author' }),
  withMethods((store) => ({
    addBook(book: Book): void {
      patchState(store, addEntity(book, { collection: 'book' }));
    },
    addAuthor(author: Author): void {
      patchState(store, addEntity(author, { collection: 'author' }));
    },
  })),
);
```

### State Tracking

**Watch state changes with watchState:**

```typescript
import { watchState } from '@ngrx/signals';

withHooks({
  onInit(store) {
    watchState(store, (state) => {
      console.log('State changed:', state);
    });
  },
});
```

### Custom Store Features

Extract reusable logic into custom features:

```typescript
export function withRequestStatus() {
  return withState({ isLoading: false, error: null });
}

export const BooksStore = signalStore(withEntities<Book>(), withRequestStatus());
```

### Best Practices

- Keep stores focused on a single domain or feature
- Use `withComputed` for derived state instead of computing in templates
- Prefer `rxMethod` for async operations over manual subscriptions
- Use entity management features for collections with IDs
- Provide stores at component level unless truly global
- Use custom features to share common patterns across stores
- Always clean up subscriptions (rxMethod handles this automatically)

**Reference:** https://ngrx.io/guide/signals

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

This API uses **Modular Monolith Architecture**. Each module is self-contained with its own domain, features, and infrastructure.

### Architectural Rules

- Keep controllers thin and push logic into services or feature handlers.
- Prefer async APIs and proper `ActionResult<T>`, including status codes.
- Use EF Core `AsNoTracking()` for read-only queries.
- Each module implements the `IModule` interface and is auto-discovered at startup.
- Use schema per module in the database (e.g., "auth", "trades").
- Organize features by vertical slice (e.g. `Register/`, `Login/`).
- **No direct module-to-module references.**

### Adding New Code

1. Identify which module it belongs to (e.g., `Modules/Trades`, `Modules/Auth`).
2. Create in appropriate folder: `Domain/`, `Features/`, `Infrastructure/`, or `API/`.
3. For new entities, create `IEntityTypeConfiguration`.
4. Controllers go in the `API/` folder.
5. Run migration if adding/changing entities.

### Entry Points

- `apps/Invenet.Api/Program.cs` - Application bootstrap with module registration
- `apps/api/Invenet.Api/Modules/` - All business modules

### Reference

- Full architecture guide: `docs/backend/MODULAR_MONOLITH.md`

## Logging and Errors

- Use structured logging in the API.
- Prefer user-friendly error messages in the UI.
- Avoid leaking secrets in logs.
