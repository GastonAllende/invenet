# Invenet - Agent Instructions

## Project Overview

Invenet is a full-stack web application built with Angular frontend and .NET backend, organized as an Nx monorepo. The application includes authentication, API services, and end-to-end testing infrastructure.

## Architecture

```
┌─────────────────┐
│  Angular SPA    │
│  (Port: TBD)    │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│  .NET API       │
│  (ASP.NET Core) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │
│   (Database)    │
└─────────────────┘
```

## Tech Stack

### Frontend

- **Framework**: Angular (latest)
- **Language**: TypeScript
- **Styling**: SCSS
- **State Management**: NgRx SignalStore (@ngrx/signals) with @angular-architects/ngrx-toolkit extensions
- **Build Tool**: Nx
- **Testing**: Playwright (E2E), Vitest (Unit)
- **Linting**: ESLint

### Backend

- **Framework**: ASP.NET Core (.NET 10.0)
- **Language**: C#
- **ORM**: Entity Framework Core
- **Authentication**: ASP.NET Core Identity
- **Database**: PostgreSQL (inferred from migrations)

### Development Tools

- **Monorepo**: Nx
- **Package Manager**: npm
- **CI/CD**: (to be configured)

## Project Structure

### Root Level

```
/
├── apps/
│   ├── invenet/              # Angular application
│   ├── invenet-e2e/          # Playwright E2E tests
│   └── Invenet.Api/          # .NET backend API
├── nx.json                   # Nx workspace configuration
├── package.json              # Node dependencies
├── invenet.sln               # .NET solution file
└── AGENT.md                  # This file
```

### Frontend Application (`apps/invenet/`)

```
src/
├── main.ts                   # Application entry point
├── index.html                # HTML template
├── styles.scss               # Global styles
└── app/
    ├── app.ts                # Root component
    ├── app.config.ts         # Application configuration
    ├── app.routes.ts         # Routing configuration
    ├── auth/                 # Authentication module
    │   ├── auth.guard.ts     # Route protection
    │   ├── auth.interceptor.ts # HTTP interceptor for tokens
    │   ├── auth.service.ts   # Authentication logic
    │   └── auth.models.ts    # Auth-related types
    ├── core/                 # Core services and config
    │   └── api.config.ts     # API configuration
    └── pages/                # Feature pages
        ├── home/
        ├── login/
        └── register/
```

### Backend API (`apps/Invenet.Api/`)

```
/
├── Program.cs                # Application entry point
├── Controllers/              # API endpoints
│   ├── AuthController.cs     # Auth endpoints (login, register, refresh)
│   ├── HealthController.cs   # Health check endpoint
│   └── WeatherForecastController.cs
├── Models/                   # Data models
│   ├── ApplicationUser.cs    # User entity
│   ├── RefreshToken.cs       # Token refresh model
│   └── Auth/                 # Auth DTOs
├── Data/                     # Database context
│   ├── AppDbContext.cs       # EF Core context
│   └── DesignTimeDbContextFactory.cs
└── Migrations/               # EF Core migrations
```

### E2E Tests (`apps/invenet-e2e/`)

```
src/
├── fixtures/                 # Test fixtures and data setup
├── helpers/                  # Test utilities
│   ├── auth.helper.ts        # Authentication helpers
│   └── test-data.ts          # Test data generation
├── pages/                    # Page Object Models
│   ├── home.page.ts
│   ├── login.page.ts
│   └── register.page.ts
└── tests/                    # Test specifications
```

## Key Features

### Authentication System

- **JWT-based authentication** with refresh tokens (follows OAuth 2.0 standards)
- **Auth Guard**: Functional route guard (`CanActivateFn`) that protects routes requiring authentication
- **Auth Interceptor**: Functional HTTP interceptor (`HttpInterceptorFn`) that automatically attaches tokens to HTTP requests
- **Identity Integration**: Uses ASP.NET Core Identity for user management with proper token validation
- **Security**: Implements proper JWT validation with signature verification, issuer/audience checks, and token expiration

### API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `GET /api/health` - Health check
- Additional endpoints in WeatherForecastController

## Development Workflow

### Prerequisites

```bash
# Install Node.js dependencies
npm install

# Restore .NET dependencies
dotnet restore

# Install .NET tools
dotnet tool restore
```

### Running the Application

#### Frontend (Angular)

```bash
# Development server with HMR (Hot Module Replacement)
npx nx serve invenet

# Build for production
npx nx build invenet --configuration=production

# Build with affected projects only (faster in monorepo)
npx nx affected:build --base=main

# Run tests
npx nx test invenet

# Run tests with coverage
npx nx test invenet --coverage

# Lint
npx nx lint invenet

# Run multiple tasks in parallel
npx nx run-many -t test lint build
```

#### Backend (.NET API)

```bash
# Navigate to API directory
cd apps/Invenet.Api

# Run the API
dotnet run

# Or watch mode (hot reload)
dotnet watch run
```

#### Database Migrations (Best Practices)

```bash
# Navigate to API directory
cd apps/Invenet.Api

# Create a new migration with descriptive name
dotnet ef migrations add AddUserRefreshTokens

# Generate SQL script for deployment (RECOMMENDED for production)
dotnet ef migrations script --idempotent --output migration.sql

# Apply migrations (development only)
dotnet ef database update

# View migration list
dotnet ef migrations list

# Rollback to specific migration
dotnet ef database update <PreviousMigrationName>

# Remove last migration (if not applied)
dotnet ef migrations remove
```

**Migration Best Practices:**

- **Review generated code** - Always inspect migration files before applying
- **Use SQL scripts in production** - Generate scripts and run via deployment pipeline
- **Test migrations** - Test both up and down migrations before production
- **Avoid data loss** - Be careful with column drops and renames
- **Use transactions** - Migrations are wrapped in transactions by default
- **Never modify applied migrations** - Create new migrations to fix issues

### Running Tests

#### E2E Tests (Playwright)

```bash
# Run all E2E tests
npx nx e2e invenet-e2e

# Run specific test file
npx nx e2e invenet-e2e --spec=ui-navigation.spec.ts

# Run with UI mode
npx nx e2e invenet-e2e --ui
```

#### Unit Tests

```bash
# Run frontend unit tests
npx nx test invenet

# Run with coverage
npx nx test invenet --coverage
```

## Working with the Codebase

### Adding a New Feature

#### Frontend (Angular)

```bash
# Generate a new component
npx nx g @nx/angular:component <component-name> --project=invenet --path=src/app/pages

# Generate a new service
npx nx g @nx/angular:service <service-name> --project=invenet --path=src/app/core/services

# Generate a new guard
npx nx g @nx/angular:guard <guard-name> --project=invenet --path=src/app/core/guards
```

#### Backend (.NET)

```bash
# Add a new controller
dotnet new webapi-controller -n <ControllerName> -o Controllers

# Add a new model
# Create file manually in Models directory

# Create migration after model changes
dotnet ef migrations add <DescriptiveName>
```

### Code Patterns

#### Angular Standalone Component Structure

```typescript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, FormsModule], // Import dependencies directly
  templateUrl: './example.html',
  styleUrls: ['./example.scss'],
})
export class ExampleComponent {
  // Modern inject() function for DI
  private exampleService = inject(ExampleService);

  // Component logic here
}
```

#### Angular Service with Dependency Injection

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExampleService {
  private http = inject(HttpClient);

  getData(): Observable<any> {
    return this.http.get('/api/data');
  }
}
```

#### Functional Route Guard (CanActivateFn)

```typescript
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirect to login with return URL
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
```

#### Functional HTTP Interceptor (HttpInterceptorFn)

```typescript
import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
    return next(cloned);
  }

  return next(req);
};
```

#### .NET Controller Pattern with Best Practices

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Apply to entire controller
public class ExampleController : ControllerBase
{
    private readonly IExampleService _exampleService;
    private readonly ILogger<ExampleController> _logger;

    public ExampleController(
        IExampleService exampleService,
        ILogger<ExampleController> logger)
    {
        _exampleService = exampleService;
        _logger = logger;
    }

    /// <summary>
    /// Gets example data
    /// </summary>
    /// <returns>Example data</returns>
    /// <response code="200">Returns the example data</response>
    /// <response code="401">If the user is not authenticated</response>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ExampleDto>> GetExample()
    {
        try
        {
            var result = await _exampleService.GetExampleAsync();
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting example data");
            return StatusCode(500, "An error occurred");
        }
    }

    /// <summary>
    /// Creates a new example
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ExampleDto>> CreateExample(
        [FromBody] CreateExampleRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _exampleService.CreateAsync(request);
        return CreatedAtAction(
            nameof(GetExample),
            new { id = result.Id },
            result);
    }
}
```

#### JWT Authentication Configuration (.NET)

```csharp
// Program.cs
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["Jwt:Authority"];
        options.Audience = builder.Configuration["Jwt:Audience"];
        options.RequireHttpsMetadata = true; // Always true in production

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ClockSkew = TimeSpan.Zero // Remove default 5 min clock skew
        };
    });

// Require authentication by default
builder.Services.AddAuthorizationBuilder()
    .SetFallbackPolicy(new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build());

var app = builder.Build();

// Middleware order is important
app.UseHttpsRedirection();
app.UseAuthentication(); // Must come before UseAuthorization
app.UseAuthorization();
```

#### NgRx SignalStore State Management

NgRx SignalStore is the modern, signals-based state management solution for Angular. It provides a lightweight, reactive approach to managing application state with excellent TypeScript support and seamless integration with Angular's new signal APIs.

**Official Documentation**:

- [@ngrx/signals](https://ngrx.io/guide/signals/signal-store)
- [@angular-architects/ngrx-toolkit](https://github.com/angular-architects/ngrx-toolkit) (Extensions)

##### Basic Store Creation

```typescript
import { signalStore, withState, withComputed, withMethods } from '@ngrx/signals';
import { computed } from '@angular/core';
import { patchState } from '@ngrx/signals';

// Define the state type
type BookState = {
  books: Book[];
  isLoading: boolean;
  filter: { query: string; order: 'asc' | 'desc' };
};

const initialState: BookState = {
  books: [],
  isLoading: false,
  filter: { query: '', order: 'asc' },
};

// Create a global store
export const BookStore = signalStore(
  { providedIn: 'root' }, // Makes it a singleton
  withState(initialState),

  // Computed values (derived state)
  withComputed(({ books, filter }) => ({
    booksCount: computed(() => books().length),
    sortedBooks: computed(() => {
      const direction = filter.order() === 'asc' ? 1 : -1;
      return books().toSorted((a, b) => direction * a.title.localeCompare(b.title));
    }),
  })),

  // Methods for state updates
  withMethods((store) => ({
    updateQuery(query: string): void {
      patchState(store, (state) => ({
        filter: { ...state.filter, query },
      }));
    },
    updateOrder(order: 'asc' | 'desc'): void {
      patchState(store, (state) => ({
        filter: { ...state.filter, order },
      }));
    },
    setBooks(books: Book[]): void {
      patchState(store, { books, isLoading: false });
    },
  })),
);
```

##### Component Usage

```typescript
import { Component, inject } from '@angular/core';
import { BookStore } from './book.store';

@Component({
  selector: 'app-book-list',
  standalone: true,
  template: `
    <!-- Access state signals directly -->
    @if (store.isLoading()) {
      <div>Loading...</div>
    }

    @for (book of store.sortedBooks(); track book.id) {
      <div class="book">{{ book.title }}</div>
    }

    <div>Total: {{ store.booksCount() }}</div>

    <button (click)="updateSort()">Sort: {{ store.filter.order() }}</button>
  `,
})
export class BookListComponent {
  protected readonly store = inject(BookStore);

  updateSort() {
    const newOrder = this.store.filter.order() === 'asc' ? 'desc' : 'asc';
    this.store.updateOrder(newOrder);
  }
}
```

##### Asynchronous Operations with RxJS

```typescript
import { inject } from '@angular/core';
import { signalStore, withState, withMethods } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, debounceTime, distinctUntilChanged, tap } from 'rxjs';

export const BookStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, bookService = inject(BookService)) => ({
    // Promise-based async method
    async loadAll(): Promise<void> {
      patchState(store, { isLoading: true });
      const books = await bookService.getAll();
      patchState(store, { books, isLoading: false });
    },

    // RxJS-based method with operators
    loadByQuery: rxMethod<string>(
      pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => patchState(store, { isLoading: true })),
        switchMap((query) =>
          bookService.getByQuery(query).pipe(
            tapResponse({
              next: (books) => patchState(store, { books }),
              error: console.error,
              finalize: () => patchState(store, { isLoading: false }),
            }),
          ),
        ),
      ),
    ),
  })),
);
```

##### Entity Management

```typescript
import { signalStore, withMethods } from '@ngrx/signals';
import { withEntities, addEntity, removeEntity, updateEntity, setAllEntities } from '@ngrx/signals/entities';

type Todo = { id: number; text: string; completed: boolean };

export const TodoStore = signalStore(
  { providedIn: 'root' },
  withEntities<Todo>(), // Provides: entities, entityMap, ids

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
    loadTodos(todos: Todo[]): void {
      patchState(store, setAllEntities(todos));
    },
  })),
);

// Use in component:
// store.entities()   // Signal<Todo[]>
// store.entityMap()  // Signal<Dictionary<Todo>>
// store.ids()        // Signal<EntityId[]>
```

##### Custom Store Features (Reusable Logic)

```typescript
import { computed } from '@angular/core';
import { signalStoreFeature, withState, withComputed } from '@ngrx/signals';

// Define reusable request status feature
export type RequestStatus = 'idle' | 'pending' | 'fulfilled' | { error: string };

export function withRequestStatus() {
  return signalStoreFeature(
    withState<{ requestStatus: RequestStatus }>({ requestStatus: 'idle' }),
    withComputed(({ requestStatus }) => ({
      isPending: computed(() => requestStatus() === 'pending'),
      isFulfilled: computed(() => requestStatus() === 'fulfilled'),
      error: computed(() => {
        const status = requestStatus();
        return typeof status === 'object' ? status.error : null;
      }),
    })),
  );
}

// Use the custom feature
export const BooksStore = signalStore(
  { providedIn: 'root' },
  withEntities<Book>(),
  withRequestStatus(), // Adds requestStatus, isPending, isFulfilled, error
  withMethods((store, booksService = inject(BooksService)) => ({
    async loadAll() {
      patchState(store, { requestStatus: 'pending' });

      try {
        const books = await booksService.getAll();
        patchState(store, setAllEntities(books), { requestStatus: 'fulfilled' });
      } catch (error) {
        patchState(store, { requestStatus: { error: error.message } });
      }
    },
  })),
);
```

##### NgRx Toolkit Extensions (@angular-architects/ngrx-toolkit)

**Redux DevTools Integration:**

```typescript
import { signalStore, withState } from '@ngrx/signals';
import { withDevtools, updateState } from '@angular-architects/ngrx-toolkit';

export const FlightStore = signalStore(
  { providedIn: 'root' },
  withDevtools('flights'), // Enable Redux DevTools
  withState({ flights: [] as Flight[] }),
  withMethods((store) => ({
    addFlight(flight: Flight): void {
      // Use updateState for custom action names in DevTools
      updateState(store, 'Add Flight', {
        flights: [...store.flights(), flight],
      });
    },
  })),
);
```

**Storage Synchronization (localStorage/sessionStorage/IndexedDB):**

```typescript
import { withStorageSync, withLocalStorage, withSessionStorage, withIndexedDB } from '@angular-architects/ngrx-toolkit';

// Sync with localStorage
export const SettingsStore = signalStore(
  { providedIn: 'root' },
  withState({ theme: 'light', language: 'en' }),
  withStorageSync('app-settings'), // Key for localStorage
);

// Selective sync (exclude sensitive data)
export const UserStore = signalStore(
  { providedIn: 'root' },
  withState({
    user: { id: 1, name: 'John', token: 'secret' },
    preferences: { notifications: true },
  }),
  withStorageSync({
    key: 'user-data',
    select: (state) => ({
      user: { ...state.user, token: undefined }, // Exclude token
      preferences: state.preferences,
    }),
  }),
);

// IndexedDB for large data
export const DocumentStore = signalStore({ providedIn: 'root' }, withState({ documents: [] as Document[] }), withStorageSync('documents', withIndexedDB()));
```

**Redux Pattern (Actions, Reducers, Effects):**

```typescript
import { signalStore, withState } from '@ngrx/signals';
import { withRedux, updateState, payload } from '@angular-architects/ngrx-toolkit';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export const FlightStore = signalStore(
  { providedIn: 'root' },
  withState({ flights: [] as Flight[] }),
  withRedux({
    actions: {
      public: {
        load: payload<{ from: string; to: string }>(),
      },
      private: {
        loaded: payload<{ flights: Flight[] }>(),
      },
    },
    reducer(actions, on) {
      on(actions.loaded, (state, { flights }) => {
        updateState(state, 'flights loaded', { flights });
      });
    },
    effects(actions, create) {
      const httpClient = inject(HttpClient);
      return {
        load$: create(actions.load).pipe(
          switchMap(({ from, to }) => httpClient.get<Flight[]>('/api/flights', { params: { from, to } })),
          tap((flights) => actions.loaded({ flights })),
        ),
      };
    },
  }),
);

// Usage:
// store.load({ from: 'NYC', to: 'LAX' });
```

**HTTP Mutations (with status tracking):**

```typescript
import { withMutations, httpMutation } from '@angular-architects/ngrx-toolkit';

export const UserStore = signalStore(
  { providedIn: 'root' },
  withState({ user: null as User | null }),
  withMutations((store) => ({
    saveUser: httpMutation({
      request: (user: User) => ({
        url: '/api/users',
        method: 'POST',
        body: user,
      }),
      parse: (response) => response as User,
      onSuccess: (user) => {
        patchState(store, { user });
      },
      onError: (error) => {
        console.error('Failed to save user:', error);
      },
    }),
  })),
);

// In component, access mutation status:
// store.saveUserIsPending() // Signal<boolean>
// store.saveUserError()     // Signal<Error | null>
// store.saveUserStatus()    // Signal<'idle' | 'pending' | 'success' | 'error'>
```

**Undo/Redo:**

```typescript
import { withUndoRedo } from '@angular-architects/ngrx-toolkit';

export const TodoStore = signalStore(
  { providedIn: 'root' },
  withEntities<Todo>(),
  withUndoRedo(), // Adds canUndo, canRedo, undo(), redo()
  withMethods((store) => ({
    addTodo(todo: Todo) {
      patchState(store, addEntity(todo));
    },
  })),
);

// Usage:
// store.canUndo()  // Signal<boolean>
// store.canRedo()  // Signal<boolean>
// store.undo()     // Undo last change
// store.redo()     // Redo last undone change
```

##### Testing SignalStores

```typescript
import { TestBed } from '@angular/core/testing';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';

describe('BookStore', () => {
  it('should calculate books count', () => {
    const store = TestBed.inject(BookStore);

    // Use unprotected for direct state manipulation in tests
    patchState(unprotected(store), {
      books: [
        { id: 1, title: 'Book 1' },
        { id: 2, title: 'Book 2' },
      ],
    });

    expect(store.booksCount()).toBe(2);
  });

  it('should sort books correctly', () => {
    const store = TestBed.inject(BookStore);

    patchState(unprotected(store), {
      books: [
        { id: 2, title: 'Zebra' },
        { id: 1, title: 'Apple' },
      ],
      filter: { query: '', order: 'asc' },
    });

    const sorted = store.sortedBooks();
    expect(sorted[0].title).toBe('Apple');
    expect(sorted[1].title).toBe('Zebra');
  });
});
```

##### Best Practices

1. **Global vs Local Stores**:
   - Use `{ providedIn: 'root' }` for global application state
   - Provide stores at component level for component-scoped state
   - Consider using route providers for feature-level state

2. **State Updates**:
   - Always use `patchState()` for immutable updates
   - Never mutate state directly
   - Use entity updaters from `@ngrx/signals/entities` for collections

3. **Computed Values**:
   - Use `withComputed()` for derived state
   - Memoization is automatic - computations only run when dependencies change
   - Keep computed functions pure

4. **Side Effects**:
   - Use `rxMethod()` for RxJS-based async operations
   - Use async methods for Promise-based operations
   - Handle errors gracefully with try/catch or tapResponse

5. **Performance**:
   - Use `OnPush` change detection with SignalStore
   - Prefer computed signals over methods that recalculate
   - Use entity management for collections (O(1) lookups via entityMap)

6. **DevTools**:
   - Always use `withDevtools()` during development
   - Use `updateState()` instead of `patchState()` for named actions in DevTools
   - Tree-shake DevTools in production builds

7. **Type Safety**:
   - Define explicit state types
   - Leverage TypeScript's inference for computed values
   - Use strict mode for better type checking

## Important Guidelines for AI Agents

### When Making Changes

1. **Frontend Changes (Angular Best Practices)**:
   - **Always use standalone components** - Modern Angular pattern, no NgModules needed
   - **Use functional guards and interceptors** - Prefer `CanActivateFn` over class-based guards
   - **Use `inject()` function** for dependency injection in functional contexts
   - **Keep components focused** - Single responsibility principle
   - **Update routing** in `app.routes.ts` when adding new pages
   - **TypeScript strict mode** - No implicit any, enable all strict checks
   - **Standalone imports** - Import dependencies directly in component decorator
   - **State Management** - Use NgRx SignalStore for reactive state:
     - Global state: `{ providedIn: 'root' }`
     - Use `patchState()` for immutable updates
     - Prefer computed signals over recalculating methods
     - Use `withDevtools()` during development
     - Entity collections: Use `withEntities()` from `@ngrx/signals/entities`

2. **Backend Changes (.NET Best Practices)**:
   - **Follow RESTful conventions** for API endpoints (proper HTTP verbs, resource naming)
   - **Use async/await** for all database operations and I/O
   - **JWT validation** - Always validate signature, issuer (`iss`), audience (`aud`), and expiration (`exp`)
   - **Never create access tokens from username/password** - Use OpenID Connect or OAuth 2.0 flows
   - **Migrations** - Review generated migrations, test before production, use SQL scripts for deployment
   - **Error handling** - Return proper HTTP status codes (401 for unauthorized, 403 for forbidden)
   - **DTOs** - Use separate request/response objects, never expose entities directly
   - **Logging** - Use ILogger liberally for debugging and monitoring

3. **Authentication & Security**:
   - **Protected routes** - Use functional `authGuard: CanActivateFn` in route configuration
   - **HTTP Interceptors** - Use functional interceptors (`HttpInterceptorFn`) with `inject()` API
   - **Token storage** - Never store tokens in localStorage; use secure HTTP-only cookies for web apps
   - **Never expose secrets** - Use environment variables or Azure Key Vault in production
   - **Token validation** - Validate all required claims: `iss`, `exp`, `aud`, `sub`, `client_id`, `iat`, `jti`
   - **HTTPS** - Always use HTTPS in production, set `RequireHttpsMetadata = true`
   - **CORS** - Configure allowed origins properly, never use wildcard in production

4. **Testing Best Practices**:
   - **Write tests first** - TDD approach when possible
   - **E2E tests** - Update when UI changes, use Page Object Model pattern
   - **Unit tests** - Mock external dependencies with Vitest
   - **Router testing** - Use `RouterTestingHarness` for testing navigation and guards
   - **Integration tests** - Test with real database when possible (containerized)
   - **Coverage** - Aim for 80%+ code coverage on critical paths

5. **Nx Monorepo Patterns**:
   - **Project structure** - Use clear separation: `apps/` for applications, `packages/` for libraries
   - **Buildable libraries** - Enable incremental builds with `dependsOn: ["^build"]`
   - **Task caching** - Leverage Nx computation caching for faster builds
   - **Generators** - Use Nx generators for consistent code scaffolding
   - **Project tags** - Tag projects with scope for better organization and linting rules

### Common Tasks

#### Add a New Protected Page

1. Generate component: `npx nx g @nx/angular:component pages/<name>`
2. Create route in `app.routes.ts` with `canActivate: [authGuard]`
3. Add navigation link if needed
4. Create Page Object Model in E2E tests
5. Write E2E test for the new page

#### Add a New API Endpoint

1. Create/update controller in `Controllers/`
2. Add `[Authorize]` attribute if authentication required
3. Create request/response DTOs in `Models/`
4. Update database models if needed
5. Create and apply migration
6. Create corresponding service method in Angular
7. Update API configuration if needed

#### Update Database Schema

1. Modify entity classes in `Models/`
2. Create migration: `dotnet ef migrations add <Name>`
3. Review generated migration code
4. Apply migration: `dotnet ef database update`
5. Update related services and controllers

### Configuration Files

- **nx.json**: Nx workspace configuration and caching
  - Configure `targetDefaults` for automatic dependency builds
  - Enable task caching for faster builds
  - Define named inputs for better cache invalidation
- **package.json**: Frontend dependencies and scripts
  - Lock exact versions in production
  - Use npm ci for reproducible builds
- **invenet.sln**: .NET solution file
  - Organize projects by layer (API, Domain, Infrastructure)
- **apps/invenet/project.json**: Angular app configuration
  - Set `buildLibsFromSource: false` for incremental builds
  - Configure `dependsOn: ["^build"]` for dependency management
- **apps/Invenet.Api/appsettings.json**: API configuration
  - **NEVER commit secrets** - use Azure Key Vault or environment variables
  - Configure JWT settings (Issuer, Audience, SigningKey reference)
  - Set proper CORS origins
- **apps/Invenet.Api/appsettings.Development.json**: Development-specific settings
  - This file should be in .gitignore
  - Use for local connection strings and development secrets

- **tsconfig.base.json**: TypeScript base configuration
  - Enable `strict: true` for type safety
  - Configure path mappings for libraries
  - Use `composite: true` for project references

### Environment Variables

Backend (typically in `appsettings.json` or environment):

- Database connection string
- JWT secret and configuration
- CORS origins

Frontend (typically in `environment.ts`):

- API base URL
- Other environment-specific settings

## Debugging

### Frontend

- Use browser DevTools
- Angular DevTools extension recommended
- Check Network tab for API calls
- Console for errors and logs

### Backend

- Use Visual Studio / VS Code debugger
- Check console output for exceptions
- Use logging (ILogger) liberally
- Test endpoints with `.http` file or Postman

### Database

- Use Entity Framework Core logging
- Check migration history: `dotnet ef migrations list`
- Direct database access for verification

## Security Considerations

1. **Never commit secrets**:
   - Use User Secrets for development: `dotnet user-secrets set "Key" "Value"`
   - Use Azure Key Vault or environment variables in production
   - Ensure `appsettings.Development.json` is in .gitignore
2. **JWT Best Practices**:
   - **Use OAuth 2.0/OpenID Connect** standards for token creation
   - **Never create tokens from direct username/password** - use proper flows
   - **Validate all required claims**: `iss`, `exp`, `aud`, `sub`, `client_id`, `iat`, `jti`
   - **Use asymmetric keys** (RS256) instead of symmetric keys (HS256) in production
   - **Set short expiration times** (15 min for access tokens, longer for refresh tokens)
   - **Use HTTP-only cookies** for web applications instead of localStorage
   - **Never log or expose tokens** in error messages
3. **CORS Configuration**:
   - **Never use wildcards** (`*`) in production
   - Specify exact allowed origins
   - Use `builder.Services.AddCors()` with named policies
   - Configure in `Program.cs` before endpoints
4. **API Security**:
   - **Return 401** for invalid/expired tokens (authentication failure)
   - **Return 403** for insufficient permissions (authorization failure)
   - **Return 404** for non-existent resources when appropriate (avoid information leakage)
   - **Use `[Authorize]`** attribute at controller level by default
   - **Implement rate limiting** to prevent abuse
5. **Input Validation**:
   - Validate on both client and server
   - Use Data Annotations on DTOs
   - Validate `ModelState.IsValid` in controllers
   - Sanitize user input for SQL, HTML, and script injection
6. **Database Security**:
   - **Use EF Core parameterized queries** (prevents SQL injection)
   - **Apply principle of least privilege** - app users shouldn't have schema modification rights
   - **Never use raw SQL** unless absolutely necessary
   - **Encrypt sensitive data** at rest and in transit
7. **Frontend Security**:
   - **XSS Protection**: Angular sanitizes by default, avoid `bypassSecurityTrust*` methods
   - **CSRF**: Use CORS and proper authentication patterns
   - **Content Security Policy**: Configure CSP headers
   - **Dependency scanning**: Regularly run `npm audit` and update dependencies
8. **HTTPS Everywhere**:
   - **Enforce HTTPS** in production
   - Set `RequireHttpsMetadata = true` for JWT Bearer authentication
   - Use HSTS headers
   - Configure automatic HTTP to HTTPS redirection

## CI/CD Considerations

### GitHub Actions Workflow

Example workflow structure:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # For Nx affected commands

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run affected tasks
        run: |
          npx nx affected -t lint test build --base=origin/main

      - name: Build .NET API
        run: |
          cd apps/Invenet.Api
          dotnet restore
          dotnet build --no-restore
          dotnet test --no-build

      - name: Run E2E tests
        run: npx nx e2e invenet-e2e
```

### Deployment Strategy

1. **Database Migrations**:
   - Generate SQL scripts: `dotnet ef migrations script --idempotent`
   - Review scripts before applying
   - Apply via deployment pipeline, not at app startup
   - Have rollback plan ready

2. **Frontend Deployment**:
   - Build with production configuration: `npx nx build invenet --configuration=production`
   - Output in `dist/` directory
   - Serve via CDN or static hosting (Azure Static Web Apps, Vercel, Netlify)
   - Enable gzip/brotli compression

3. **Backend Deployment**:
   - Use `dotnet publish` for optimized build
   - Configure connection strings via environment variables
   - Use managed identity for Azure resources
   - Enable health checks

4. **Environment Configuration**:
   - Development: Local dev settings
   - Staging: Production-like environment for testing
   - Production: Secure secrets, monitoring, scaling

## Nx Monorepo Best Practices

### Project Organization

```
apps/
  ├── invenet/           # Main Angular application
  ├── invenet-e2e/       # E2E tests
  └── Invenet.Api/       # .NET backend
packages/              # (Future) Shared libraries
  ├── ui/               # Shared UI components
  ├── data-access/      # Data access layer
  └── utils/            # Utility functions
```

### Incremental Builds

To enable fast incremental builds in the monorepo:

1. **Configure Target Defaults** in `nx.json`:

```json
{
  "targetDefaults": {
    "@nx/angular:application": {
      "dependsOn": ["^build"]
    },
    "@nx/angular:ng-packagr-lite": {
      "dependsOn": ["^build"]
    },
    "build": {
      "cache": true
    },
    "test": {
      "cache": true
    },
    "lint": {
      "cache": true
    }
  }
}
```

2. **Set buildLibsFromSource: false** in application `project.json`:

```json
{
  "targets": {
    "build": {
      "options": {
        "buildLibsFromSource": false
      }
    },
    "serve": {
      "options": {
        "buildLibsFromSource": false
      }
    }
  }
}
```

3. **Use Affected Commands**:

```bash
# Only test/build/lint projects affected by changes
npx nx affected:test --base=main
npx nx affected:build --base=main
npx nx affected:lint --base=main

# Run all tasks for affected projects
npx nx affected -t test lint build
```

### Task Caching

Nx automatically caches task outputs for faster rebuilds:

- Task inputs are hashed (source files, dependencies, env vars)
- If inputs haven't changed, outputs are restored from cache
- Local cache is stored in `node_modules/.cache/nx`
- Can be extended to remote/distributed caching with Nx Cloud

### Project Graph

View and understand project dependencies:

```bash
# Open interactive dependency graph
npx nx graph

# View specific project dependencies
npx nx show project invenet --web
```

### Generators for Consistency

Use Nx generators to ensure consistent code structure:

```bash
# Generate a new library
npx nx g @nx/angular:library ui --directory=packages/ui

# Generate a component
npx nx g @nx/angular:component button --project=ui

# Generate a service
npx nx g @nx/angular:service data --project=ui
```

## Performance Optimization

### Frontend (Angular)

1. **Lazy Loading Routes**:

```typescript
export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.component').then((m) => m.AdminComponent),
    canActivate: [authGuard],
  },
];
```

2. **OnPush Change Detection**:

```typescript
@Component({
  selector: 'app-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
```

3. **TrackBy for Lists**:

```typescript
trackById(index: number, item: any): any {
  return item.id; // or unique identifier
}
```

```html
<div *ngFor="let item of items; trackBy: trackById">{{ item.name }}</div>
```

4. **Angular Signals** (Modern Approach):

```typescript
import { signal, computed } from '@angular/core';

export class ExampleComponent {
  count = signal(0);
  doubleCount = computed(() => this.count() * 2);

  increment() {
    this.count.update((val) => val + 1);
  }
}
```

### Backend (.NET)

1. **Use Async/Await Everywhere**:

```csharp
public async Task<ActionResult<IEnumerable<User>>> GetUsersAsync()
{
    return await _context.Users.ToListAsync();
}
```

2. **Database Query Optimization**:

```csharp
// Use projection to select only needed columns
var users = await _context.Users
    .Where(u => u.IsActive)
    .Select(u => new UserDto { Id = u.Id, Name = u.Name })
    .ToListAsync();

// Use AsNoTracking for read-only queries
var users = await _context.Users
    .AsNoTracking()
    .ToListAsync();
```

3. **Response Caching**:

```csharp
[HttpGet]
[ResponseCache(Duration = 60, Location = ResponseCacheLocation.Client)]
public async Task<ActionResult<WeatherForecast[]>> GetWeather()
{
    return await _weatherService.GetForecastAsync();
}
```

4. **Use connection pooling** (enabled by default in EF Core)

5. **Implement pagination** for large datasets:

```csharp
public async Task<PagedResult<User>> GetUsersAsync(int page, int pageSize)
{
    var query = _context.Users.AsQueryable();
    var total = await query.CountAsync();
    var items = await query
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();

    return new PagedResult<User>(items, total, page, pageSize);
}
```

### Common Issues

**"Cannot connect to database"**

- Check connection string in `appsettings.json` or user secrets
- Verify PostgreSQL is running: `pg_isready -h localhost -p 5432`
- Check database exists: `psql -l`
- Verify network connectivity and firewall rules
- Check database user permissions

**"Migration pending" / "Database is out of sync"**

- Check migrations: `dotnet ef migrations list`
- Apply pending migrations: `dotnet ef database update`
- If migration fails, review SQL for issues
- Consider using `--verbose` flag for detailed error info

**"CORS error" / "Access-Control-Allow-Origin"**

- Update CORS policy in `Program.cs`:
  ```csharp
  builder.Services.AddCors(options =>
  {
      options.AddPolicy("AllowAngularApp",
          policy => policy
              .WithOrigins("http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials());
  });
  ```
- Ensure `app.UseCors("AllowAngularApp")` is called before `app.UseAuthorization()`
- Check API URL in Angular environment files

**"401 Unauthorized"**

- Check if token is being sent (Browser DevTools → Network tab → Headers)
- Verify token hasn't expired (decode JWT at jwt.io)
- Ensure `authInterceptor` is provided in app config
- Check `Authorization` header format: `Bearer <token>`
- Verify JWT configuration matches on frontend and backend

**"403 Forbidden"**

- User is authenticated but lacks required permissions
- Check user roles/claims in token
- Verify `[Authorize(Roles = "...")]` or custom policies match user permissions
- Review authorization logic in guards and policies

**"Nx cache issues" / "Stale build artifacts"**

- Clear Nx cache: `npx nx reset`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for conflicting global Nx installations

**"Angular module not found" / "Cannot find module '@angular-demo/...'"**

- Verify path mapping in `tsconfig.base.json`
- Check library is built: `npx nx build <library-name>`
- Ensure library exports are correct in `index.ts`
- Clear TypeScript cache: delete `.angular/cache` directory

**"EF Core model changes not reflected"**

- Create new migration: `dotnet ef migrations add <Name>`
- Apply migration: `dotnet ef database update`
- If needed, drop and recreate database (dev only): `dotnet ef database drop && dotnet ef database update`

**".NET Hot Reload not working"**

- Ensure using `dotnet watch run` instead of `dotnet run`
- Check file is saved and .NET is watching correct directory
- Restart watch if needed: Ctrl+C then `dotnet watch run`

**"Playwright/E2E tests failing"**

- Ensure both frontend and backend are running
- Install Playwright browsers: `npx playwright install`
- Check test selectors match current UI
- Run tests in headed mode for debugging: `npx nx e2e invenet-e2e --headed`
- Check for timing issues - add proper waits

### Debugging Tips

1. **Frontend (Angular)**:
   - Use Angular DevTools browser extension
   - Check browser console for errors (F12)
   - Use Network tab to inspect API calls
   - Set breakpoints in browser DevTools Sources tab
   - Use `console.log()` strategically but remove before committing

2. **Backend (.NET)**:
   - Use VS Code debugger (F5) or Visual Studio
   - Add breakpoints in code
   - Check console output for exceptions and logs
   - Use `_logger.LogInformation/Warning/Error()` liberally
   - Test API endpoints with .http files or REST client

3. **Database**:
   - Use database client (pgAdmin, Azure Data Studio, DBeaver)
   - Check migration history: `SELECT * FROM __EFMigrationsHistory`
   - Enable SQL logging in EF Core:
     ```csharp
     builder.Services.AddDbContext<AppDbContext>(options =>
         options.UseNpgsql(connectionString)
               .LogTo(Console.WriteLine, LogLevel.Information));
     ```

4. **Performance Issues**:
   - Use browser DevTools Performance tab
   - Check bundle sizes: `npx nx build invenet --stats-json`
   - Analyze with webpack-bundle-analyzer
   - Profile API with dotnet-trace or Application Insights
   - Check for N+1 query problems in EF Core

## Resources

### Official Documentation

- [Angular Documentation](https://angular.dev) - Official Angular docs with modern patterns
- [.NET Documentation](https://docs.microsoft.com/en-us/dotnet/) - Comprehensive .NET guides
- [ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/) - Web API, authentication, and more
- [Entity Framework Core](https://docs.microsoft.com/en-us/ef/core/) - ORM documentation
- [Nx Documentation](https://nx.dev) - Monorepo tooling and best practices
- [Playwright Documentation](https://playwright.dev) - E2E testing framework
- [Vitest Documentation](https://vitest.dev) - Unit testing framework

### Security & Authentication

- [OAuth 2.0 Specification](https://oauth.net/2/) - OAuth 2.0 authorization framework
- [OpenID Connect](https://openid.net/connect/) - Identity layer on OAuth 2.0
- [JWT.io](https://jwt.io/) - JWT decoder and documentation
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Web security risks

### Best Practices

- [Angular Style Guide](https://angular.dev/style-guide) - Official Angular coding standards
- [.NET API Guidelines](https://github.com/microsoft/api-guidelines) - Microsoft REST API guidelines
- [C# Coding Conventions](https://docs.microsoft.com/en-us/dotnet/csharp/fundamentals/coding-style/coding-conventions) - C# style guide
- [PostgreSQL Documentation](https://www.postgresql.org/docs/) - Database documentation

### Tools

- [Angular DevTools](https://angular.dev/tools/devtools) - Browser extension for Angular debugging
- [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) - VS Code extension for testing APIs
- [ESLint](https://eslint.org/) - JavaScript/TypeScript linting
- [Prettier](https://prettier.io/) - Code formatting

## Next Steps for Development

### Immediate Priorities

1. **Configure environment files properly**
   - Set up development, staging, and production configurations
   - Configure user secrets for local development
   - Set up Azure Key Vault for production secrets

2. **Enhance authentication flow**
   - Implement token refresh mechanism
   - Add remember me functionality
   - Implement password reset flow
   - Add email verification

3. **Set up comprehensive error handling**
   - Global error handler in Angular
   - Centralized exception handling in .NET
   - User-friendly error messages
   - Error logging with Application Insights

### Short-term Goals

4. **Implement logging strategy**
   - Structured logging with Serilog
   - Log aggregation (Azure Log Analytics, ELK)
   - Set appropriate log levels
   - Implement request correlation IDs

5. **Add API documentation**
   - Set up Swagger/OpenAPI
   - Document all endpoints with XML comments
   - Add request/response examples
   - Configure Swagger UI for development

6. **Configure production build settings**
   - Optimize Angular build (AOT, lazy loading, tree shaking)
   - Configure .NET publish profiles
   - Set up bundle analysis
   - Enable compression and minification

7. **Set up CI/CD pipeline**
   - Automated testing on PR
   - Automated deployments to staging
   - Manual approval for production
   - Database migration automation

### Medium-term Goals

8. **Add more comprehensive test coverage**
   - Unit tests for services and components
   - Integration tests for API endpoints
   - E2E tests for critical user flows
   - Performance tests for API

9. **Implement monitoring and analytics**
   - Application Performance Monitoring (APM)
   - User analytics
   - Error tracking (Sentry, Application Insights)
   - Health checks and uptime monitoring

10. **Create shared libraries in monorepo**
    - UI component library (`packages/ui`)
    - Data access layer (`packages/data-access`)
    - Shared utilities (`packages/utils`)
    - Type definitions (`packages/types`)

### Long-term Enhancements

11. **Advanced features**
    - Implement caching strategy (Redis)
    - Add real-time features (SignalR)
    - Implement feature flags
    - Add data export functionality
    - Implement audit logging

12. **Performance optimization**
    - Implement CDN for static assets
    - Add database indexes
    - Optimize queries with query plans
    - Implement background job processing

13. **Security hardening**
    - Regular security audits
    - Dependency vulnerability scanning
    - Penetration testing
    - Configure security headers
    - Implement rate limiting

14. **Scalability improvements**
    - Horizontal scaling strategy
    - Load balancing configuration
    - Database replication
    - Microservices architecture (if needed)

---

**Last Updated**: 2026-02-07  
**Project Version**: Initial Development Phase

---

## Quick Reference Cheatsheet

### Most Common Commands

```bash
# Frontend Development
npx nx serve invenet                    # Start dev server
npx nx build invenet --configuration=production
npx nx test invenet --watch             # Run tests in watch mode
npx nx lint invenet                     # Lint code
npx nx e2e invenet-e2e                  # Run E2E tests

# Backend Development
cd apps/Invenet.Api
dotnet watch run                        # Start API with hot reload
dotnet ef migrations add <Name>         # Create migration
dotnet ef migrations script --idempotent # Generate SQL script
dotnet ef database update               # Apply migrations
dotnet test                             # Run tests

# Nx Monorepo
npx nx graph                            # View dependency graph
npx nx affected -t test lint build      # Run tasks on affected projects
npx nx reset                            # Clear Nx cache
npx nx show project <name>              # Show project details

# Git Workflow
git checkout -b feature/<name>          # Create feature branch
git add .
git commit -m "feat: description"       # Conventional commits
git push origin feature/<name>
```

### Angular Quick Patterns

```typescript
// Standalone Component
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule],
  template: `...`
})
export class ExampleComponent {}

// Inject Services
private service = inject(MyService);

// Route Guard
export const authGuard: CanActivateFn = (route, state) => {
  return inject(AuthService).isAuthenticated();
};

// HTTP Interceptor
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next(req);
};
```

### SignalStore Quick Patterns

```typescript
// Basic Store
export const MyStore = signalStore(
  { providedIn: 'root' },
  withState({ items: [] }),
  withComputed(({ items }) => ({
    count: computed(() => items().length)
  })),
  withMethods((store) => ({
    add(item: any) {
      patchState(store, { items: [...store.items(), item] });
    }
  }))
);

// Entity Store
export const TodoStore = signalStore(
  { providedIn: 'root' },
  withEntities<Todo>(),
  withMethods((store) => ({
    addTodo: (todo) => patchState(store, addEntity(todo)),
    removeTodo: (id) => patchState(store, removeEntity(id)),
  }))
);

// Async Operations
withMethods((store, service = inject(MyService)) => ({
  load: rxMethod<void>(
    pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(() => service.getData().pipe(
        tapResponse({
          next: (data) => patchState(store, { data }),
          error: console.error,
          finalize: () => patchState(store, { loading: false }),
        })
      ))
    )
  )
}))

// Component Usage
protected store = inject(MyStore);
items = this.store.items;      // Signal<Item[]>
count = this.store.count;      // Signal<number>

// With DevTools
import { withDevtools } from '@angular-architects/ngrx-toolkit';
withDevtools('storeName'),

// With Storage Sync
import { withStorageSync } from '@angular-architects/ngrx-toolkit';
withStorageSync('storage-key'),

// With Undo/Redo
import { withUndoRedo } from '@angular-architects/ngrx-toolkit';
withUndoRedo(),
// Provides: canUndo(), canRedo(), undo(), redo()
```

### .NET Quick Patterns

```csharp
// Controller
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExampleController : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ExampleDto>> Get()
    {
        return Ok(await _service.GetAsync());
    }
}

// EF Core Query
var items = await _context.Items
    .Where(i => i.IsActive)
    .AsNoTracking()
    .ToListAsync();

// Async Service Method
public async Task<Result> ProcessAsync(Request request)
{
    await _repository.SaveAsync(request);
    return Result.Success();
}
```

### Essential Files to Know

| File                                | Purpose                                     |
| ----------------------------------- | ------------------------------------------- |
| `nx.json`                           | Nx workspace config, caching, task defaults |
| `tsconfig.base.json`                | TypeScript config, path mappings            |
| `apps/invenet/project.json`         | Angular app build configuration             |
| `apps/Invenet.Api/Program.cs`       | .NET app startup, middleware config         |
| `apps/Invenet.Api/appsettings.json` | API configuration (never commit secrets)    |
| `app.routes.ts`                     | Angular routing configuration               |
| `app.config.ts`                     | Angular app-level providers                 |

### When Things Go Wrong

| Problem        | Solution                                       |
| -------------- | ---------------------------------------------- |
| Build fails    | `npx nx reset && npm install`                  |
| DB out of sync | `dotnet ef database update`                    |
| Token issues   | Check Network tab, verify expiration at jwt.io |
| CORS errors    | Update CORS policy in Program.cs               |
| Tests failing  | Check if apps are running, install browsers    |
| Type errors    | Check `tsconfig.base.json` paths               |

---

_Remember: This is a living document. Update it as the project evolves!_
