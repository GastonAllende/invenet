# Angular Best Practices Guide

This guide provides comprehensive best practices for Angular development aligned with Angular 21+ and modern patterns, specifically tailored for **Nx monorepo** architecture.

**Official Angular Documentation:** https://angular.dev  
**Nx Documentation:** https://nx.dev

## Table of Contents

- [Project Structure](#project-structure) (Nx Monorepo)
- [Components](#components)
- [State Management](#state-management)
- [Services & Dependency Injection](#services--dependency-injection)
- [Templates](#templates)
- [Forms](#forms)
- [Routing](#routing)
- [Performance](#performance)
- [Security](#security)
- [Testing](#testing)
- [Build & Deployment](#build--deployment)

## Project Structure

### Nx Monorepo Organization

This project uses **Nx monorepo** with apps and libs structure:

```
invenet/                   # Nx workspace root
├── apps/
│   ├── invenet/           # Main Angular application
│   │   └── src/
│   │       ├── app/
│   │       │   ├── pages/         # Page components (login, register, etc.)
│   │       │   ├── layout/        # Layout components and services
│   │       │   ├── app.routes.ts  # App routing
│   │       │   ├── app.config.ts  # App configuration
│   │       │   └── app.ts         # Root component
│   │       ├── assets/            # Static assets
│   │       ├── main.ts            # Bootstrap
│   │       └── styles.scss
│   │
│   ├── invenet-e2e/       # E2E tests
│   │
│   └── api/               # .NET Backend
│       └── Invenet.Api/
│
├── libs/                  # Domain-driven libraries
│   ├── auth/              # Authentication domain
│   │   ├── feature/       # Routed pages (login, register)
│   │   ├── data-access/   # Auth service, interceptors, guards
│   │   ├── ui/            # Auth form components
│   │   └── util/          # Token helpers, validators
│   │
│   ├── dashboard/         # Dashboard domain
│   │   ├── feature/       # Dashboard page + containers
│   │   ├── data-access/   # Dashboard store, services
│   │   ├── ui/            # Widget components
│   │   └── util/          # Dashboard helpers
│   │
│   ├── trades/            # Trading domain
│   │   ├── feature/       # Trades page + containers
│   │   ├── data-access/   # Trades store, API service
│   │   ├── ui/            # Trade table, forms, cards
│   │   └── util/          # Trade calculators, formatters
│   │
│   ├── analytics/         # Analytics domain
│   │   ├── feature/       # Analytics page + containers
│   │   ├── data-access/   # Analytics store, services
│   │   ├── ui/            # Charts, graphs components
│   │   └── util/          # Data transformers
│   │
│   ├── strategies/        # Strategies domain
│   │   ├── feature/       # Strategies page + containers
│   │   ├── data-access/   # Strategies store, services
│   │   ├── ui/            # Strategy card, form components
│   │   └── util/          # Strategy calculators
│   │
│   ├── accounts/          # Accounts domain (similar structure)
│   │
│   └── core/              # Shared infrastructure (no domain)
│       └── util/          # App-wide utilities, configs, models
│
├── nx.json                # Nx configuration
├── package.json
└── tsconfig.base.json     # Base TypeScript config
```

### Nx Library Structure

Each library follows this structure:

```
libs/trades/feature/
├── src/
│   ├── index.ts           # Public API - exports only what's needed
│   ├── lib/               # Library implementation
│   │   ├── trades-page.component.ts
│   │   ├── trades-container.component.ts
│   │   └── trades.routes.ts
│   └── test-setup.ts      # Test configuration
├── project.json           # Nx project configuration
├── tsconfig.json          # Library TypeScript config
├── tsconfig.lib.json      # Build config
├── tsconfig.spec.json     # Test config
├── vite.config.mts        # Vite configuration
└── README.md
```

### Library Types in Nx (Domain-Driven)

Each domain has **4 library types**:

#### 1. **Feature Libraries** (`feature`)

- **Purpose**: Routed UI + smart/container components
- **Contains**: Pages, route definitions, container components
- **Example**: `libs/trades/feature`
- **Contents**:
  - Route-level components (`trades-page.component.ts`)
  - Container components that connect UI to data
  - Route configuration (`trades.routes.ts`)
- **Can depend on**: Own domain's data-access, ui, util + shared core

```typescript
// libs/trades/feature/src/lib/trades-page.component.ts
import { TradesStore } from '@invenet/trades/data-access';
import { TradeTableComponent } from '@invenet/trades/ui';

@Component({
  imports: [TradeTableComponent],
  providers: [TradesStore],
  template: `<trade-table [trades]="store.trades()" />`,
})
export class TradesPageComponent {
  readonly store = inject(TradesStore);
}
```

#### 2. **Data Access Libraries** (`data-access`)

- **Purpose**: State management, API calls, caching
- **Contains**: SignalStores, services, repositories, HTTP clients
- **Example**: `libs/trades/data-access`
- **Contents**:
  - SignalStore for domain state
  - API service for backend calls
  - Repository pattern implementations
  - Data caching logic
- **Can depend on**: Own domain's util + shared core

```typescript
// libs/trades/data-access/src/lib/trades.store.ts
export const TradesStore = signalStore(
  withEntities<Trade>(),
  withMethods((store, api = inject(TradesApiService)) => ({
    loadTrades: rxMethod<void>(/* ... */),
  })),
);

// libs/trades/data-access/src/lib/trades-api.service.ts
@Injectable({ providedIn: 'root' })
export class TradesApiService {
  getTrades(): Observable<Trade[]> {
    /* ... */
  }
}
```

### Dependency Rules (Critical)

**Allowed Dependencies:**

```
feature → data-access, ui, util (same domain) + core
data-access → util (same domain) + core
ui → util (same domain) + core
util → nothing (pure utilities)
core → nothing
```

**Forbidden:**

- ❌ Cross-domain feature dependencies (`trades-feature` → `dashboard-feature`)
- ❌ Util depending on feature/data-access/ui
- ❌ UI depending on data-access or feature
- ❌ Core depending on any domain

### Importing from Libraries

```typescript
// ✅ Import from library's public API
import { TradesStore } from '@invenet/trades/data-access';
import { TradeTableComponent } from '@invenet/trades/ui';
import { calculateProfit } from '@invenet/trades/util';
import { ApiConfig } from '@invenet/core/util';

// ❌ Don't import from internal paths
import { TradesStore } from '@invenet/trades/data-access/src/lib/trades.store';

// ❌ Don't cross domain boundaries in features
import { DashboardStore } from '@invenet/dashboard/data-access'; // In trades-feature
```

### Path Mapping

Configured in `tsconfig.base.json`:

````json
{
  "compilerOptions": {
    "paths": {
      "@invenet/trades-feature": ["libs/trades/trades-feature/src/index.ts"],
      "@invenet/trades-data-access": ["libs/trades/trades-data-access/src/index.ts"],
      "@invenet/trades-ui": ["libs/trades/trades-ui/src/index.ts"],
      "@invenet/trades-util": ["libs/trades/trades-util/src/index.ts"],

      "@invenet/dashboard-feature": ["libs/dashboard/dashboard-feature/src/index.ts"],
      "@invenet/dashboard-data-access": ["libs/dashboard/dashboard-data-access/src/index.ts"],
      "@invenet/dashboard-ui": ["libs/dashboard/dashboard-ui/src/index.ts"],
      "@invenet/dashboard-util": ["libs/dashboard/dashboard-util/src/index.ts"],

      "@invenet/core-util": ["libs/core/core-util
  - API service for backend calls
  - Repository pattern implementations
  - Data caching logic
- **Can depend on**: Own domain's util + shared core

```typescript
// libs/trades/data-access/src/lib/trades.store.ts
export const TradesStore = signalStore(
  withEntities<Trade>(),
  withMethods((store, api = inject(TradesApiService)) => ({
    loadTrades: rxMethod<void>(/* ... */)
  }))
);

// libs/trades/data-access/src/lib/trades-api.service.ts
@Injectable({ providedIn: 'root' })
export class TradesApiService {
  getTrades(): Observable<Trade[]> { /* ... */ }
}
````

#### 3. **UI Libraries** (`ui`)

- **Purpose**: Presentational/dumb components
- **Contains**: Reusable presentational components
- **Example**: `libs/trades/ui`
- **Contents**:
  - Pure presentational components
  - No business logic or state management
  - Only `@Input()` and `@Output()`
  - Highly reusable within domain
- **Can depend on**: Own domain's util + shared core

```typescript
// libs/trades/ui/src/lib/trade-table/trade-table.component.ts
@Component({
  selector: 'trade-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradeTableComponent {
  trades = input.required<Trade[]>();
  tradeSelected = output<Trade>();

  // Pure presentation logic only
  onRowClick(trade: Trade) {
    this.tradeSelected.emit(trade);
  }
}
```

#### 4. **Util Libraries** (`util`)

- **Purpose**: Pure helper functions, pipes, validators
- **Contains**: Utility functions, formatters, mappers, validators
- **Example**: `libs/trades/util`
- **Contents**:
  - Pure functions (no dependencies)
  - Domain-specific formatters
  - Data transformers/mappers
  - Custom validators
  - Calculation helpers
- **Can depend on**: Nothing (pure utilities)

```typescript
// libs/trades/util/src/lib/trade-calculations.ts
export function calculateProfit(trade: Trade): number {
  return (trade.exitPrice - trade.entryPrice) * trade.quantity;
}

export function calculateProfitPercentage(trade: Trade): number {
  return ((trade.exitPrice - trade.entryPrice) / trade.entryPrice) * 100;
}

// libs/trades/util/src/lib/trade-formatters.ts
export function formatTradeStatus(status: TradeStatus): string {
  return status.replace('_', ' ').toLowerCase();
}
```

#### 5. **Shared Core Library** (`core/util`)

- **Purpose**: App-wide shared utilities
- **Contains**: Global configs, models, utilities used across domains
- **Example**: `libs/core/util`
- **No dependencies** on any domain libraries
  Domain:\*\*

```bash
# Create all 4 libraries for a new domain (e.g., "orders")
npx nx generate @nx/angular:library feature \
  --directory=libs/orders/orders-feature \
  --importPath=@invenet/orders-feature \
  --standalone

npx nx generate @nx/angular:library data-access \
  --directory=libs/orders/orders-data-access \
  --importPath=@invenet/orders-data-access \
  --standalone

npx nx generate @nx/angular:library ui \
  --directory=libs/orders/orders-ui \
  --importPath=@invenet/orders-ui \
  --standalone

npx nx generate @nx/angular:library util \
  --directory=libs/orders/orders-util \
  --importPath=@invenet/orders-util \
  --standalone
```

**Enforce Dependency Rules with ESLint:**

Add to `.eslintrc.json`:

```json
{
  "overrides": [
    {
      "files": ["*.ts"],
      "rules": {
        "@nx/enforce-module-boundaries": [
          "error",
          {
            "depConstraints": [
              {
                "sourceTag": "type:feature",
                "onlyDependOnLibsWithTags": [
                  "type:data-access",
                  "type:ui",
                  "type:util",
                  "scope:shared"
                ]
              },
              {
                "sourceTag": "type:data-access",
                "onlyDependOnLibsWithTags": ["type:util", "scope:shared"]
              },
              {
                "sourceTag": "type:ui",
                "onlyDependOnLibsWithTags": ["type:util", "scope:shared"]
              },
              {
                "sourceTag": "type:util",
                "onlyDependOnLibsWithTags": ["scope:shared"]
              }

```

# Feature library structure

libs/trades/trades-feature/src/lib/
├── trades-page.component.ts
├── trades-page.component.html
├── trades-container.component.ts
├── trades.routes.ts
└── index.ts (optional internal barrel)

# Data-access library structure

libs/trades/trades-data-access/src/lib/
├── stores/
│ └── trades.store.ts
├── services/
│ └── trades-api.service.ts
└── models/
└── trade.model.ts

# UI library structure

libs/trades/trades-ui/src/lib/
├── trade-table/
│ ├── trade-table.component.ts
│ └── trade-table.component.html
├── trade-card/
│ ├── trade-card.component.ts
│ └── trade-card.component.html
└── trade-form/
├── trade-form.component.ts
└── trade-form.component.html

# Util library structure

libs/trades/trades-util/src/lib/
├── calculators/
│ └── profit-calculator.ts
├── formatters/
│ └── trade-formatters.ts
├── validators/
│ └── trade-validators.ts
└── mappers/
└── trade-mappers.ts

````

**When to Create a New Domain:**
- Feature is logically separate (e.g., trades, analytics, dashboard)
- Has its own data model and business logic
- Can be developed/tested independently
- May have different team ownership

**When to Add to Existing Domain:**
- Feature extends existing domain logic
- Shares the same data models
- Would create circular dependencies if separatedag Libraries in project.json:**
```json
{
  "name": "trades-feature",
  "tags": ["scope:trades", "type:feature"]
}
````

{Each domain has 4 libraries: feature, data-access, ui, util

- Keep library-specific code in `libs/{domain}/{domain-type}/src/lib/`
- Use folders within `lib/` for logical grouping
- Export only public API through `src/index.ts`
- Co-locate tests next to the code they test (`.spec.ts` files)

**App Organization:**

- Page components go in `apps/invenet/src/app/pages/`
- Layout components go in `apps/invenet/src/app/layout/`
- App shell only - delegate to domain libraries
- **Minimal code in app** - most logic lives in libs

**Example Domain (Trades):**

```
libs/trades/
├── trades-feature/src/lib/
│   ├── trades-page.component.ts
│   ├── trades-page.component.spec.ts
│   └── trades.routes.ts
│
├── trades-data-access/src/lib/
│   ├── stores/
│   │   ├── trades.store.ts
│   │   └── trades.store.spec.ts
│   └── services/
│       ├── trades-api.service.ts
│       └── trades-api.service.spec.ts
│
├── trades-ui/src/lib/
│   ├── trade-table/
│   │   ├── trade-table.component.ts
│   │   └── trade-table.component.spec.ts
│   └── trade-card/
│       ├── trade-card.component.ts
│       └── trade-card.component.spec.ts
│
└── trades-util/src/lib/
    ├── calculators.ts
    ├── calculators.spec.ts
    └── formatters.ts
```

**Public API Exports (index.ts examples):**

````typescript
// libs/trades/trades-feature/src/index.ts
export * from './lib/trades-page.component';
export { TRADES_ROUTES } from './lib/trades.routes';

// libs/trades/trades-data-access/src/index.ts
export * from './lib/stores/trades.store';
export * from './lib/services/trades-api.service';
export * from './lib/models/trade.model';

// libs/trades/trades-ui/src/index.ts
export * from './lib/trade-table/trade-table.component';
export * from './lib/trade-card/trade-card.component';

// libs/trades/trades-util/src/index.ts
export * from './lib/calculators';
export * from './lib/formatters';
**Library Dependency Rules:**
- Feature libs can depend on utility libs (e.g., `auth` → `core`)
- Feature libs should NOT depend on other feature libs
- Utility libs should NOT depend on feature libs
- Use Nx boundary rules in `.eslintrc.json` to enforce

**Run Commands:**
```bash
# Serve the app
npx nx serve invenet

# Test a specific library
npx nx test auth

# Build a library
npx nx build auth

# Lint a library
npx nx lint auth

# Run affected commands (only what changed)
npx nx affected:test
npx nx affected:build
npx nx affected:lint
````

**Nx Graph Visualization:**

```bash
# View project dependencies
npx nx graph
```

**Library Public API (index.ts):**

```typescript
// libs/auth/src/index.ts
// Only export what consumers need
export * from './lib/auth.service';
export * from './lib/auth.guard';
export * from './lib/auth.interceptor';
export * from './lib/auth.models';

// Don't export internal implementation details
// ❌ export * from './lib/internal-helper.service';
```

**Organizing Library Code:**

```
libs/my-feature/src/lib/
├── components/        # Feature components
├── services/          # Feature services
├── models/            # TypeScript interfaces/types
├── guards/            # Route guards
├── interceptors/      # HTTP interceptors
├── utils/             # Helper functions
└── index.ts           # Internal barrel export (optional)
```

### Naming Conventions

- **Components**: `user-profile.component.ts`
- **Services**: `user.service.ts`
- **Directives**: `highlight.directive.ts`
- **Pipes**: `currency-format.pipe.ts`
- **Guards**: `auth.guard.ts`
- **Interfaces**: `user.interface.ts` or `user.model.ts`

### File Organization

**General Rules:**

- Keep related files close (component, template, styles, spec)
- Extract large templates to separate `.html` files
- One component/service per file
- Max 400 lines per file (split if larger)

**Nx Library Organization:**

- Keep library-specific code in `libs/{library-name}/src/lib/`
- Use folders within `lib/` for logical grouping (components/, services/, etc.)
- Export only public API through `src/index.ts`
- Co-locate tests next to the code they test (`.spec.ts` files)

**App Organization:**

- Page components go in `apps/invenet/src/app/pages/`
- Layout components go in `apps/invenet/src/app/layout/`
- App-specific services can live alongside components or in a `services/` folder
- Prefer moving reusable logic to libraries

**Example:**

```
libs/auth/src/lib/
├── guards/
│   ├── auth.guard.ts
│   └── auth.guard.spec.ts
├── interceptors/
│   ├── auth.interceptor.ts
│   └── auth.interceptor.spec.ts
├── services/
│   ├── auth.service.ts
│   └── auth.service.spec.ts
└── models/
    └── auth.models.ts
```

## Components

### Use Standalone Components (Angular 14+)

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-profile',
  standalone: true, // Default in Angular 20+
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileComponent {
  // Component logic
}
```

### Use OnPush Change Detection

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyComponent {
  // Reactive patterns with signals or observables
}
```

**Benefits:**

- Better performance
- Forces reactive patterns
- Prevents unnecessary change detection cycles

### Prefer Signals for Component State (Angular 16+)

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
    <p>Count: {{ count() }}</p>
    <p>Double: {{ doubleCount() }}</p>
    <button (click)="increment()">+</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CounterComponent {
  count = signal(0);
  doubleCount = computed(() => this.count() * 2);

  increment() {
    this.count.update((c) => c + 1);
  }
}
```

### Use input() and output() Functions

```typescript
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-user-card',
  template: `
    <div (click)="selected.emit(user())">
      <h3>{{ user().name }}</h3>
    </div>
  `,
})
export class UserCardComponent {
  // Input as signal
  user = input.required<User>();

  // Output as EventEmitter
  selected = output<User>();
}
```

### Component Lifecycle

- **Use effect() for side effects** instead of lifecycle hooks when working with signals
- **Cleanup automatically** - effects and subscriptions in inject() context clean up on destroy
- **Avoid logic in constructors** - use `ngOnInit` or `effect()`

```typescript
import { Component, effect, inject } from '@angular/core';

@Component({})
export class MyComponent {
  private userService = inject(UserService);
  user = signal<User | null>(null);

  constructor() {
    // Effect runs when dependencies change
    effect(() => {
      console.log('User changed:', this.user());
    });

    // Load initial data
    this.loadUser();
  }

  private async loadUser() {
    this.user.set(await this.userService.getCurrentUser());
  }
}
```

### Keep Components Focused

- Single responsibility
- Delegate complex logic to services
- Max 3-4 public methods
- Avoid business logic in components

## State Management

### Local State: Signals

```typescript
export class ProductListComponent {
  products = signal<Product[]>([]);
  filter = signal('');

  filteredProducts = computed(() => {
    const filterValue = this.filter().toLowerCase();
    return this.products().filter((p) => p.name.toLowerCase().includes(filterValue));
  });

  updateFilter(value: string) {
    this.filter.set(value);
  }
}
```

### Shared State: SignalStore

See [NGRX_SIGNALSTORE_GUIDE.md](NGRX_SIGNALSTORE_GUIDE.md) for comprehensive patterns.

### Avoid Stateful Services

```typescript
// ❌ Bad - Stateful service
@Injectable({ providedIn: 'root' })
export class UserService {
  currentUser: User | null = null; // Shared mutable state
}

// ✅ Good - Return observables or signals
@Injectable({ providedIn: 'root' })
export class UserService {
  private currentUser = signal<User | null>(null);

  getCurrentUser = this.currentUser.asReadonly();

  setUser(user: User) {
    this.currentUser.set(user);
  }
}
```

## Services & Dependency Injection

### Use inject() Function

```typescript
import { Component, inject } from '@angular/core';

@Component({})
export class MyComponent {
  // ✅ Preferred
  private userService = inject(UserService);
  private router = inject(Router);

  // ❌ Avoid constructor DI for new code
  constructor(private oldStyleService: OldStyleService) {}
}
```

### Service Scope

```typescript
// ✅ Root singleton for app-wide services
@Injectable({ providedIn: 'root' })
export class ApiService {}

// ✅ Component-level for component-specific logic
@Component({
  providers: [LocalStateService],
})
export class MyComponent {}
```

### Async Operations

```typescript
@Injectable({ providedIn: 'root' })
export class DataService {
  private http = inject(HttpClient);

  // Return observables, don't subscribe in service
  getData(): Observable<Data[]> {
    return this.http.get<Data[]>('/api/data');
  }

  // Or use async/await for simpler flows
  async fetchData(): Promise<Data[]> {
    return firstValueFrom(this.http.get<Data[]>('/api/data'));
  }
}
```

### Error Handling in Services

```typescript
@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('/api/products').pipe(
      retry(3),
      catchError((error) => {
        console.error('Failed to load products:', error);
        return of([]); // Graceful fallback
      }),
    );
  }
}
```

## Templates

### Use Native Control Flow (Angular 17+)

```typescript
// ✅ New syntax
@if (user()) {
  <p>Welcome {{ user().name }}</p>
} @else {
  <p>Please log in</p>
}

@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
} @empty {
  <p>No items found</p>
}

@switch (status()) {
  @case ('loading') {
    <spinner />
  }
  @case ('error') {
    <error-message />
  }
  @default {
    <content />
  }
}

// ❌ Old syntax - avoid in new code
<p *ngIf="user">Welcome {{ user.name }}</p>
<div *ngFor="let item of items">{{ item.name }}</div>
```

### Avoid Complex Logic in Templates

```typescript
// ❌ Bad
<div [class.active]="user.isAdmin && user.hasPermission('write') && !user.isSuspended">

// ✅ Good - use computed signal
export class MyComponent {
  canEdit = computed(() =>
    this.user().isAdmin &&
    this.user().hasPermission('write') &&
    !this.user().isSuspended
  );
}
<div [class.active]="canEdit()">
```

### Use Class and Style Bindings

```typescript
// ✅ Preferred
<div [class.active]="isActive()">
<div [style.color]="textColor()">
<div [class]="{ active: isActive(), disabled: isDisabled() }">

// ❌ Avoid
<div [ngClass]="{ active: isActive() }">
<div [ngStyle]="{ color: textColor }">
```

### No Arrow Functions in Templates

```typescript
// ❌ Bad - creates new function on every change detection
<button (click)="items().filter(i => i.active)">

// ✅ Good - use computed or component method
items = signal<Item[]>([]);
activeItems = computed(() => this.items().filter(i => i.active));

<button (click)="getActiveItems()">
```

### Track By for Lists

```typescript
@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
}

// For trackBy function:
@for (item of items(); track trackByFn($index, item)) {
  <div>{{ item.name }}</div>
}

trackByFn(index: number, item: Item): number {
  return item.id;
}
```

## Forms

### Prefer Reactive Forms

```typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
      <input formControlName="name" />
      <input formControlName="email" type="email" />
      <button type="submit" [disabled]="!userForm.valid">Submit</button>
    </form>
  `,
})
export class UserFormComponent {
  private fb = inject(FormBuilder);

  userForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit() {
    if (this.userForm.valid) {
      console.log(this.userForm.value);
    }
  }
}
```

### Form Validation

```typescript
// Built-in validators
Validators.required;
Validators.email;
Validators.minLength(3);
Validators.maxLength(50);
Validators.pattern(/^[a-zA-Z ]+$/);

// Custom validator
function ageValidator(control: AbstractControl): ValidationErrors | null {
  const age = control.value;
  if (age !== null && (age < 18 || age > 100)) {
    return { invalidAge: true };
  }
  return null;
}

userForm = this.fb.group({
  age: ['', [Validators.required, ageValidator]],
});
```

### Display Validation Errors

```typescript
<input formControlName="email" />
@if (userForm.controls.email.invalid && userForm.controls.email.touched) {
  <div class="error">
    @if (userForm.controls.email.errors?.['required']) {
      Email is required
    }
    @if (userForm.controls.email.errors?.['email']) {
      Invalid email format
    }
  </div>
}
```

## Routing

### Lazy Loading

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'user/:id',
    loadComponent: () => import('./user/user.component').then((m) => m.UserComponent),
  },
];
```

### Route Guards

```typescript
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

// In routes
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [authGuard]
}
```

### Route Parameters with Signals

```typescript
import { Component, input } from '@angular/core';

@Component({})
export class UserDetailComponent {
  // Automatically bound from route params with withComponentInputBinding()
  id = input.required<string>();

  constructor() {
    effect(() => {
      console.log('User ID:', this.id());
      this.loadUser(this.id());
    });
  }
}
```

## Performance

### OnPush Change Detection

Always use `ChangeDetectionStrategy.OnPush` for better performance.

### Use NgOptimizedImage

```typescript
import { NgOptimizedImage } from '@angular/common';

@Component({
  imports: [NgOptimizedImage],
  template: `
    <img ngSrc="/hero.jpg" width="400" height="300" priority />
  `
})
```

**Benefits:**

- Automatic srcset generation
- Lazy loading by default
- Preconnect to image CDN
- Prevents layout shift

### Lazy Load Everything Possible

- Lazy load routes
- Lazy load images (except above-the-fold)
- Defer heavy components

### Avoid Memory Leaks

```typescript
// ✅ Signals and inject() clean up automatically
export class MyComponent {
  private data = inject(DataService);

  constructor() {
    // Effect cleans up on component destroy
    effect(() => {
      console.log(this.data.value());
    });
  }
}

// ⚠️ Manual subscriptions need cleanup
export class OldComponent implements OnDestroy {
  private subscription = new Subscription();

  ngOnInit() {
    this.subscription.add(this.data$.subscribe(console.log));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
```

### Bundle Optimization

- Use production builds: `ng build --configuration=production`
- Analyze bundle: `ng build --stats-json` + `webpack-bundle-analyzer`
- Remove unused code
- Use tree-shakeable providers

## Security

### Sanitization

Angular automatically sanitizes values:

```typescript
// HTML is automatically sanitized
<div [innerHTML]="userContent"></div>

// To bypass (use with extreme caution):
import { DomSanitizer } from '@angular/platform-browser';

constructor(private sanitizer: DomSanitizer) {}

get trustedHtml() {
  return this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
}
```

### HTTP Security

```typescript
// ✅ Use HttpClient - includes XSRF protection
private http = inject(HttpClient);

// ✅ Validate on backend too
getData(userId: string) {
  return this.http.get(`/api/users/${encodeURIComponent(userId)}`);
}
```

### Authentication

```typescript
@Injectable({ providedIn: 'root' })
export class AuthInterceptor implements HttpInterceptor {
  private auth = inject(AuthService);

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = this.auth.getToken();

    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }

    return next.handle(req);
  }
}
```

### Never Store Secrets in Frontend

- API keys should be on backend
- Use environment variables for configuration
- Never commit sensitive data

## Testing

### Component Testing

```typescript
import { TestBed } from '@angular/core/testing';
import { UserComponent } from './user.component';

describe('UserComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(UserComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should display user name', () => {
    const fixture = TestBed.createComponent(UserComponent);
    fixture.componentInstance.user.set({ name: 'John' });
    fixture.detectChanges();

    const element = fixture.nativeElement;
    expect(element.textContent).toContain('John');
  });
});
```

### Service Testing

```typescript
describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch users', () => {
    const mockUsers = [{ id: 1, name: 'John' }];

    service.getUsers().subscribe((users) => {
      expect(users).toEqual(mockUsers);
    });

    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });

  afterEach(() => {
    httpMock.verify();
  });
});
```

### Testing Best Practices

- Test behavior, not implementation
- Use meaningful test descriptions
- One assertion per test when possible
- Mock external dependencies
- Achieve 80%+ code coverage for critical paths

## Build & Deployment

### Environment Configuration

```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
};

// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.example.com',
};
```

### Build Commands

**Nx Monorepo Commands:**

```bash
# Development server
npx nx serve invenet

# Production build (app)
npx nx build invenet --configuration=production

# Build specific library
npx nx build auth

# Test production build locally
npx http-server dist/apps/invenet/browser

# Run all tests
npx nx run-many -t test

# Run affected tests (only changed code)
npx nx affected:test

# Lint all
npx nx run-many -t lint

# Build all projects
npx nx run-many -t build
```

**Standard Angular CLI Commands (also work):**

```bash
# Development
ng serve

# Production build
ng build --configuration=production
```

### Optimization Checklist

- [ ] Enable production mode
- [ ] Enable Ahead-of-Time (AOT) compilation (default)
- [ ] Enable build optimizer (default in prod)
- [ ] Use OnPush change detection
- [ ] Lazy load routes
- [ ] Use NgOptimizedImage
- [ ] Minimize bundle size
- [ ] Enable gzip/brotli compression on server
- [ ] Add caching headers
- [ ] Use CDN for static assets

## General Best Practices

### Code Style

- Use Prettier for formatting
- Use ESLint for linting
- Follow official Angular style guide
- Use meaningful names
- Keep functions small and focused
- Write comments for complex logic only

### TypeScript

- Enable strict mode
- Avoid `any` - use `unknown` if needed
- Use interfaces for object shapes
- Use type inference when obvious
- Use union types and const enums

### Code Organization

- Feature-based folder structure
- Shared code in shared folder
- Keep related files together
- Extract reusable logic
- Don't repeat yourself (DRY)

### Documentation

- Document public APIs
- Use JSDoc for complex functions
- Keep README updated
- Document architectural decisions
- Include code examples

## Resources

### Angular

- Official Angular Docs: https://angular.dev
- Angular Style Guide: https://angular.dev/style-guide
- Angular CLI: https://angular.dev/cli
- Angular Update Guide: https://angular.dev/update-guide
- RxJS Documentation: https://rxjs.dev

### Nx

- Nx Documentation: https://nx.dev
- Nx Angular Plugin: https://nx.dev/nx-api/angular
- Nx Tutorial: https://nx.dev/getting-started/tutorials/angular-monorepo-tutorial
- Nx Console (VS Code Extension): https://marketplace.visualstudio.com/items?itemName=nrwl.angular-console
- Nx Cloud: https://nx.app
