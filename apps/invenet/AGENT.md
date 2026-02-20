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
- See `docs/ANGULAR_BEST_PRACTICES.md` for comprehensive Angular guidelines.

## Feature Libraries

### Accounts (`libs/accounts`)

Brokerage account management with CRUD operations:
- **Route**: `/accounts` (protected by authGuard)
- **Shell**: `AccountsShellComponent` exported as `Accounts`
- **Store**: `AccountsStore` with SignalStore pattern
- **API**: REST endpoints at `/api/accounts`
- **Features**: Create, list, view, edit accounts with risk settings
- **Docs**: See `libs/accounts/README.md` for detailed API

**Usage in routes**:
```typescript
import { Accounts } from '@invenet/accounts';

{ path: 'accounts', component: Accounts, canActivate: [authGuard] }
```

## Quick Reference: NgRx SignalStore

### Creating a Store

```typescript
import { signalStore, withState, withMethods } from '@ngrx/signals';
import { patchState } from '@ngrx/signals';

export const CounterStore = signalStore(
  withState({ count: 0 }),
  withMethods((store) => ({
    increment: () => patchState(store, { count: store.count() + 1 }),
  })),
);
```

### Using in Component

```typescript
@Component({
  providers: [CounterStore],
  template: `<p>{{ store.count() }}</p>`,
})
export class Counter {
  readonly store = inject(CounterStore);
}
```

### With Entities

```typescript
import { withEntities, addEntity } from '@ngrx/signals/entities';

export const TodosStore = signalStore(
  withEntities<Todo>(),
  withMethods((store) => ({
    addTodo: (todo: Todo) => patchState(store, addEntity(todo)),
  })),
);
```

### Async with rxMethod

```typescript
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';

loadBooks: rxMethod<void>(
  pipe(
    tap(() => patchState(store, { isLoading: true })),
    switchMap(() =>
      service.getBooks().pipe(
        tapResponse({
          next: (books) => patchState(store, { books, isLoading: false }),
          error: () => patchState(store, { isLoading: false }),
        }),
      ),
    ),
  ),
);
```

For complete patterns, see [State Management](../../docs/AGENT_PLAYBOOK.md#state-management-ngrx-signalstore) in the playbook.
