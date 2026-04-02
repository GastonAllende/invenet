# NgRx SignalStore - Complete Guide

This guide provides comprehensive patterns and best practices for using NgRx SignalStore in the Invenet application.

**Official Documentation:** https://ngrx.io/guide/signals

## Table of Contents

- [Installation](#installation)
- [Core Concepts](#core-concepts)
- [Creating Stores](#creating-stores)
- [State Updates](#state-updates)
- [Computed State](#computed-state)
- [Methods](#methods)
- [Async Operations](#async-operations)
- [Entity Management](#entity-management)
- [State Tracking](#state-tracking)
- [Custom Features](#custom-features)
- [Testing](#testing)
- [Common Patterns](#common-patterns)

## Installation

```bash
npm install @ngrx/signals --save
```

## Core Concepts

### SignalStore

A `signalStore` is a reactive state container built on Angular Signals. It provides:

- Type-safe state management
- Automatic change detection
- Composable features with `with*` functions
- Built-in entity management
- RxJS interoperability

### Key Building Blocks

- `withState` - Define initial state
- `withComputed` - Create derived state
- `withMethods` - Add actions/methods
- `withHooks` - Lifecycle hooks (onInit, onDestroy)
- `withEntities` - Manage collections with IDs
- `patchState` - Update state immutably

## Creating Stores

### Basic Store

```typescript
import { signalStore, withState, withMethods } from '@ngrx/signals';
import { patchState } from '@ngrx/signals';

export const CounterStore = signalStore(
  withState({ count: 0 }),
  withMethods((store) => ({
    increment(): void {
      patchState(store, { count: store.count() + 1 });
    },
    decrement(): void {
      patchState(store, { count: store.count() - 1 });
    },
    reset(): void {
      patchState(store, { count: 0 });
    },
  })),
);
```

### Store with Computed State

```typescript
import { computed } from '@angular/core';
import { signalStore, withState, withComputed } from '@ngrx/signals';

type UserState = {
  firstName: string;
  lastName: string;
  age: number;
};

export const UserStore = signalStore(
  withState<UserState>({
    firstName: '',
    lastName: '',
    age: 0,
  }),
  withComputed(({ firstName, lastName, age }) => ({
    fullName: computed(() => `${firstName()} ${lastName()}`),
    isAdult: computed(() => age() >= 18),
  })),
);
```

### Store with Dependency Injection

```typescript
import { signalStore, withMethods } from '@ngrx/signals';
import { inject } from '@angular/core';

export const BooksStore = signalStore(
  withState({ books: [], isLoading: false }),
  withMethods((store, booksService = inject(BooksService)) => ({
    async loadBooks(): Promise<void> {
      patchState(store, { isLoading: true });
      try {
        const books = await booksService.getBooks();
        patchState(store, { books, isLoading: false });
      } catch (error) {
        patchState(store, { isLoading: false });
      }
    },
  })),
);
```

## State Updates

### Using patchState

```typescript
import { patchState } from '@ngrx/signals';

// Update with object
patchState(store, { count: 10 });

// Update with function
patchState(store, (state) => ({ count: state.count + 1 }));

// Update multiple properties
patchState(store, {
  count: 0,
  isLoading: false,
  error: null,
});
```

### Never Use mutate

```typescript
// ❌ WRONG - Don't use mutate
patchState(store, (state) => {
  state.items.mutate((items) => items.push(newItem));
});

// ✅ CORRECT - Use update or set
patchState(store, (state) => ({
  items: [...state.items, newItem],
}));
```

## Computed State

```typescript
import { computed } from '@angular/core';
import { signalStore, withState, withComputed } from '@ngrx/signals';

type CartState = {
  items: Array<{ id: number; price: number; quantity: number }>;
  discount: number;
};

export const CartStore = signalStore(
  withState<CartState>({ items: [], discount: 0 }),
  withComputed(({ items, discount }) => ({
    subtotal: computed(() => items().reduce((sum, item) => sum + item.price * item.quantity, 0)),
    total: computed(() => {
      const sub = items().reduce((sum, item) => sum + item.price * item.quantity, 0);
      return sub - (sub * discount()) / 100;
    }),
    itemCount: computed(() => items().reduce((sum, item) => sum + item.quantity, 0)),
  })),
);
```

## Methods

### Synchronous Methods

```typescript
export const TodosStore = signalStore(
  withState({ todos: [], filter: 'all' }),
  withMethods((store) => ({
    setFilter(filter: string): void {
      patchState(store, { filter });
    },
    addTodo(text: string): void {
      const newTodo = { id: Date.now(), text, completed: false };
      patchState(store, (state) => ({
        todos: [...state.todos, newTodo],
      }));
    },
    toggleTodo(id: number): void {
      patchState(store, (state) => ({
        todos: state.todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
      }));
    },
  })),
);
```

### Methods with Other Methods

```typescript
export const AuthStore = signalStore(
  withState({ user: null, token: null }),
  withMethods((store) => ({
    setUser(user: User): void {
      patchState(store, { user });
    },
    setToken(token: string): void {
      patchState(store, { token });
    },
    login(user: User, token: string): void {
      // Call other methods
      store.setUser(user);
      store.setToken(token);
    },
    logout(): void {
      patchState(store, { user: null, token: null });
    },
  })),
);
```

## Async Operations

### Using rxMethod

```typescript
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, debounceTime, distinctUntilChanged } from 'rxjs';
import { tapResponse } from '@ngrx/operators';

export const ProductsStore = signalStore(
  withState({
    products: [],
    isLoading: false,
    error: null,
    searchQuery: '',
  }),
  withMethods((store, productsService = inject(ProductsService)) => ({
    // Load products
    loadProducts: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() =>
          productsService.getProducts().pipe(
            tapResponse({
              next: (products) =>
                patchState(store, {
                  products,
                  isLoading: false,
                  error: null,
                }),
              error: (error) =>
                patchState(store, {
                  isLoading: false,
                  error: error.message,
                }),
            }),
          ),
        ),
      ),
    ),

    // Search with debounce
    search: rxMethod<string>(
      pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap((query) => patchState(store, { searchQuery: query, isLoading: true })),
        switchMap((query) =>
          productsService.search(query).pipe(
            tapResponse({
              next: (products) =>
                patchState(store, {
                  products,
                  isLoading: false,
                }),
              error: (error) =>
                patchState(store, {
                  isLoading: false,
                  error: error.message,
                }),
            }),
          ),
        ),
      ),
    ),
  })),
);
```

### Calling rxMethod

```typescript
@Component({
  providers: [ProductsStore],
  template: `
    <input [ngModel]="store.searchQuery()" (ngModelChange)="store.search($event)" />

    @if (store.isLoading()) {
      <p>Loading...</p>
    }

    @for (product of store.products(); track product.id) {
      <div>{{ product.name }}</div>
    }
  `,
})
export class ProductList implements OnInit {
  readonly store = inject(ProductsStore);

  ngOnInit() {
    // Can be called with void
    this.store.loadProducts();

    // Can be called with signal
    this.store.search(this.searchSignal);

    // Can be called with static value
    this.store.search('laptop');
  }
}
```

## Entity Management

### Basic Entity Collection

```typescript
import { signalStore } from '@ngrx/signals';
import { withEntities, addEntity, removeEntity, updateEntity } from '@ngrx/signals/entities';

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

export const TodosStore = signalStore(
  withEntities<Todo>(),
  withMethods((store) => ({
    addTodo(todo: Todo): void {
      patchState(store, addEntity(todo));
    },
    removeTodo(id: number): void {
      patchState(store, removeEntity(id));
    },
    updateTodo(id: number, changes: Partial<Todo>): void {
      patchState(store, updateEntity({ id, changes }));
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

### Available Entity Signals

When using `withEntities<T>()`, you get:

- `entityMap` - Record of entities by ID
- `entities` - Array of all entities
- `ids` - Array of all IDs
- `selectedEntity` - Currently selected entity (if using selection)

### Entity Updaters

```typescript
import { addEntity, addEntities, setEntity, setEntities, setAllEntities, updateEntity, updateEntities, updateAllEntities, removeEntity, removeEntities, removeAllEntities } from '@ngrx/signals/entities';

// Add single entity
patchState(store, addEntity(newTodo));

// Add multiple entities
patchState(store, addEntities([todo1, todo2]));

// Set/replace entity
patchState(store, setEntity(updatedTodo));

// Set/replace all entities
patchState(store, setAllEntities([todo1, todo2]));

// Update entity
patchState(store, updateEntity({ id: 1, changes: { completed: true } }));

// Update multiple entities
patchState(
  store,
  updateEntities({
    ids: [1, 2],
    changes: { completed: true },
  }),
);

// Update all entities
patchState(store, updateAllEntities({ text: '' }));

// Remove entity
patchState(store, removeEntity(1));

// Remove multiple entities
patchState(store, removeEntities([1, 2]));

// Remove all entities
patchState(store, removeAllEntities());
```

### Named Collections

```typescript
import { type } from '@ngrx/signals';

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

// Access: store.bookEntities(), store.authorEntities()
```

### Custom Entity Configuration

```typescript
import { entityConfig } from '@ngrx/signals/entities';

type Product = {
  sku: string;
  name: string;
  price: number;
};

const productConfig = entityConfig({
  entity: type<Product>(),
  collection: 'product',
  selectId: (product) => product.sku, // Use SKU instead of id
});

export const ProductsStore = signalStore(
  withEntities(productConfig),
  withMethods((store) => ({
    addProduct(product: Product): void {
      patchState(store, addEntity(product, productConfig));
    },
  })),
);
```

## State Tracking

### Using watchState

```typescript
import { watchState } from '@ngrx/signals';
import { withHooks } from '@ngrx/signals';

export const LoggingStore = signalStore(
  withState({ count: 0 }),
  withHooks({
    onInit(store) {
      // Logs every state change synchronously
      watchState(store, (state) => {
        console.log('State changed:', state);
      });
    },
  }),
);
```

### watchState vs effect

```typescript
withHooks({
  onInit(store) {
    // watchState - logs every change synchronously
    watchState(store, (state) => {
      console.log('[watchState]', state);
    });
    // Logs: { count: 0 }, { count: 1 }, { count: 2 }

    // effect - logs final state after coalescing
    effect(() => {
      console.log('[effect]', getState(store));
    });
    // Logs: { count: 2 }

    store.increment();
    store.increment();
  },
});
```

## Custom Features

### Creating Custom Features

```typescript
import { signalStoreFeature, withState } from '@ngrx/signals';

export function withRequestStatus() {
  return signalStoreFeature(
    withState({
      isLoading: false,
      error: null as string | null,
    }),
  );
}

export function withPagination(pageSize = 10) {
  return signalStoreFeature(
    withState({
      page: 1,
      pageSize,
    }),
    withComputed(({ page, pageSize }) => ({
      offset: computed(() => (page() - 1) * pageSize()),
    })),
    withMethods((store) => ({
      nextPage: () =>
        patchState(store, (state) => ({
          page: state.page + 1,
        })),
      prevPage: () =>
        patchState(store, (state) => ({
          page: Math.max(1, state.page - 1),
        })),
      goToPage: (page: number) => patchState(store, { page }),
    })),
  );
}
```

### Using Custom Features

```typescript
export const BooksStore = signalStore(withEntities<Book>(), withRequestStatus(), withPagination(20));

// Available: store.isLoading(), store.error(),
//           store.page(), store.nextPage(), etc.
```

## Testing

### Testing Stores

```typescript
import { TestBed } from '@angular/core/testing';
import { CounterStore } from './counter.store';

describe('CounterStore', () => {
  let store: InstanceType<typeof CounterStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CounterStore],
    });
    store = TestBed.inject(CounterStore);
  });

  it('should initialize with count 0', () => {
    expect(store.count()).toBe(0);
  });

  it('should increment count', () => {
    store.increment();
    expect(store.count()).toBe(1);
  });

  it('should decrement count', () => {
    store.increment();
    store.increment();
    store.decrement();
    expect(store.count()).toBe(1);
  });
});
```

### Testing with Entities

```typescript
import { TodosStore } from './todos.store';

describe('TodosStore', () => {
  let store: InstanceType<typeof TodosStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TodosStore],
    });
    store = TestBed.inject(TodosStore);
  });

  it('should add todo', () => {
    const todo = { id: 1, text: 'Test', completed: false };
    store.addTodo(todo);

    expect(store.entities()).toEqual([todo]);
    expect(store.entityMap()).toEqual({ 1: todo });
  });

  it('should toggle todo', () => {
    const todo = { id: 1, text: 'Test', completed: false };
    store.addTodo(todo);
    store.toggleTodo(1);

    expect(store.entityMap()[1].completed).toBe(true);
  });
});
```

### Testing Async Operations

```typescript
import { fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';

describe('BooksStore', () => {
  let store: InstanceType<typeof BooksStore>;
  let service: jasmine.SpyObj<BooksService>;

  beforeEach(() => {
    const serviceSpy = jasmine.createSpyObj('BooksService', ['getBooks']);

    TestBed.configureTestingModule({
      providers: [BooksStore, { provide: BooksService, useValue: serviceSpy }],
    });

    store = TestBed.inject(BooksStore);
    service = TestBed.inject(BooksService) as jasmine.SpyObj<BooksService>;
  });

  it('should load books', fakeAsync(() => {
    const books = [{ id: 1, title: 'Book 1' }];
    service.getBooks.and.returnValue(of(books));

    store.loadBooks();
    tick();

    expect(store.books()).toEqual(books);
    expect(store.isLoading()).toBe(false);
  }));
});
```

## Common Patterns

### Loading State Pattern

```typescript
type RequestState = 'idle' | 'loading' | 'success' | 'error';

export const DataStore = signalStore(
  withState({
    data: [],
    status: 'idle' as RequestState,
    error: null as string | null,
  }),
  withComputed(({ status }) => ({
    isLoading: computed(() => status() === 'loading'),
    isSuccess: computed(() => status() === 'success'),
    isError: computed(() => status() === 'error'),
  })),
  withMethods((store, service = inject(DataService)) => ({
    load: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { status: 'loading', error: null })),
        switchMap(() =>
          service.getData().pipe(
            tapResponse({
              next: (data) =>
                patchState(store, {
                  data,
                  status: 'success',
                }),
              error: (error) =>
                patchState(store, {
                  status: 'error',
                  error: error.message,
                }),
            }),
          ),
        ),
      ),
    ),
  })),
);
```

### Form State Pattern

```typescript
export const UserFormStore = signalStore(
  withState({
    firstName: '',
    lastName: '',
    email: '',
    isDirty: false,
    isSaving: false,
  }),
  withComputed(({ firstName, lastName, email }) => ({
    isValid: computed(() => firstName().trim() !== '' && lastName().trim() !== '' && email().includes('@')),
  })),
  withMethods((store, userService = inject(UserService)) => ({
    updateField(field: string, value: string): void {
      patchState(store, { [field]: value, isDirty: true });
    },
    save: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isSaving: true })),
        switchMap(() => {
          const state = getState(store);
          return userService.saveUser(state).pipe(
            tapResponse({
              next: () =>
                patchState(store, {
                  isSaving: false,
                  isDirty: false,
                }),
              error: () => patchState(store, { isSaving: false }),
            }),
          );
        }),
      ),
    ),
    reset(): void {
      patchState(store, {
        firstName: '',
        lastName: '',
        email: '',
        isDirty: false,
        isSaving: false,
      });
    },
  })),
);
```

### Filter/Sort Pattern

```typescript
export const ProductsStore = signalStore(
  withEntities<Product>(),
  withState({
    filter: '',
    sortBy: 'name' as keyof Product,
    sortDirection: 'asc' as 'asc' | 'desc',
  }),
  withComputed(({ entities, filter, sortBy, sortDirection }) => ({
    filteredAndSortedProducts: computed(() => {
      let products = entities();

      // Filter
      if (filter()) {
        products = products.filter((p) => p.name.toLowerCase().includes(filter().toLowerCase()));
      }

      // Sort
      return [...products].sort((a, b) => {
        const aVal = a[sortBy()];
        const bVal = b[sortBy()];
        const direction = sortDirection() === 'asc' ? 1 : -1;
        return aVal > bVal ? direction : -direction;
      });
    }),
  })),
  withMethods((store) => ({
    setFilter(filter: string): void {
      patchState(store, { filter });
    },
    setSortBy(sortBy: keyof Product): void {
      patchState(store, { sortBy });
    },
    toggleSortDirection(): void {
      patchState(store, (state) => ({
        sortDirection: state.sortDirection === 'asc' ? 'desc' : 'asc',
      }));
    },
  })),
);
```

## Migration from NgRx Store

If migrating from classic NgRx Store:

| NgRx Store           | SignalStore                |
| -------------------- | -------------------------- |
| `createFeature`      | `signalStore`              |
| `createAction`       | Method in `withMethods`    |
| `createReducer`      | `withState` + `patchState` |
| `createSelector`     | `withComputed`             |
| `createEffect`       | `rxMethod`                 |
| `dispatch(action())` | `store.method()`           |
| `store.select()`     | `store.signal()`           |

## Best Practices

1. **Provide at Component Level** when possible for better encapsulation
2. **Keep stores focused** on a single domain or feature
3. **Use computed for derived state** instead of computing in templates
4. **Prefer rxMethod** for async operations over manual subscriptions
5. **Use entity features** for collections with IDs
6. **Extract custom features** for reusable patterns
7. **Never use mutate** - always use `update` or `set`
8. **Type your state** explicitly for better IntelliSense
9. **Cleanup is automatic** - rxMethod and watchState handle cleanup
10. **Test stores** like any other service

## Resources

- Official Docs: https://ngrx.io/guide/signals
- SignalStore API: https://ngrx.io/guide/signals/signal-store
- Entity Management: https://ngrx.io/guide/signals/signal-store/entity-management
- RxJS Interop: https://ngrx.io/guide/signals/rxjs-integration
