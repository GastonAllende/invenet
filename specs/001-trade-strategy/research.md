# Research: Trade Strategy Association

**Date**: February 18, 2026  
**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Overview

This document captures technology decisions and implementation patterns for the Trade Strategy Association feature. All decisions align with the existing Invenet tech stack and architecture patterns.

## Technology Decisions

### 1. Frontend State Management

**Decision**: NgRx SignalStore for strategy state management

**Rationale**:
- Aligns with existing Invenet frontend architecture (already using NgRx SignalStore)
- Provides reactive state management with Angular signals integration
- Simpler than traditional NgRx Store for feature-level state
- Built-in support for async operations and loading states
- Excellent TypeScript support and type safety

**Alternatives Considered**:
- **Traditional NgRx Store with Effects**: More verbose, heavier setup for this relatively simple feature
- **Angular Services with BehaviorSubject**: Less standardized, would diverge from project patterns
- **Signals-only (no store)**: Insufficient for complex async operations and shared state

**Implementation Pattern**:
```typescript
// libs/strategies/src/lib/strategies/data-access/strategies.store.ts
export const StrategiesStore = signalStore(
  { providedIn: 'root' },
  withState({
    strategies: [] as Strategy[],
    selectedStrategy: null as Strategy | null,
    loading: false,
    error: null as string | null,
  }),
  withMethods((store, strategiesService = inject(StrategiesService)) => ({
    // CRUD operations
  }))
);
```

### 2. Frontend UI Components

**Decision**: PrimeNG for all UI components (forms, tables, dropdowns)

**Rationale**:
- Existing UI library in Invenet (consistency with rest of app)
- Comprehensive component library (p-dropdown, p-table, p-dialog, p-button)
- Built-in accessibility features
- Consistent styling and theming
- Strong Angular integration

**Alternatives Considered**:
- **Material Design**: Would introduce additional dependency and inconsistent UX
- **Custom components**: Reinventing the wheel, slower development
- **Headless UI libraries**: Requires more styling work, breaks consistency

**Key Components Used**:
- `p-dropdown` / `p-autoComplete`: Strategy selector in trade forms
- `p-table`: Strategy list management
- `p-dialog`: Create/edit strategy modal
- `p-button`, `p-inputText`, `p-textarea`: Form controls

### 3. Backend Module Structure

**Decision**: New "Strategies" module in modular monolith architecture

**Rationale**:
- Follows existing Invenet backend architecture (Auth, Trades, Health modules)
- Strategies are a bounded context deserving own module
- Enables independent deployment and testing
- Clear separation of concerns
- Aligns with MODULE_TEMPLATE.md pattern

**Alternatives Considered**:
- **Add to Trades module**: Strategies are not trade-specific, traders may want strategy management independent of trades
- **Microservice**: Overkill for this feature, increases complexity unnecessarily
- **Shared module**: Strategies have their own domain logic and API, deserve dedicated module

**Module Structure**:
```
Modules/Strategies/
├── StrategiesModule.cs       # IModule implementation
├── API/
│   └── StrategiesController.cs
├── Domain/
│   └── Strategy.cs
├── Features/                 # Vertical slices
│   ├── CreateStrategy/
│   ├── UpdateStrategy/
│   ├── DeleteStrategy/
│   ├── GetStrategy/
│   └── ListStrategies/
└── Infrastructure/
    └── Data/
        └── StrategyConfiguration.cs
```

### 4. Database Relationship Design

**Decision**: Optional foreign key from Trade to Strategy (nullable StrategyId)

**Rationale**:
- Trades can exist without strategies (new feature, historical data)
- One-to-many relationship (one strategy, many trades)
- Strategies should not be hard-deleted if trades reference them (soft delete pattern)
- Account-scoped data enforced at application level

**Alternatives Considered**:
- **Required strategy on all trades**: Breaking change for existing trades, forces migration pain
- **Many-to-many relationship**: Overcomplicates for no business value (trades use one strategy at a time)
- **Strategy as embedded value object**: Loses referenceability, can't update strategy globally

**Schema Design**:
```sql
-- New table
CREATE TABLE strategies.strategies (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES accounts.accounts(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    UNIQUE(account_id, name)  -- Prevent duplicate names per account
);

-- Modification to existing trades table
ALTER TABLE trades.trades
ADD COLUMN strategy_id UUID REFERENCES strategies.strategies(id);

CREATE INDEX idx_trades_strategy_id ON trades.trades(strategy_id);
```

### 5. Soft Delete vs Hard Delete

**Decision**: Soft delete for strategies (mark as deleted, don't remove)

**Rationale**:
- Preserves data integrity for historical trades
- Allows recovery if user accidentally deletes strategy
- Prevents broken references in trade history
- Simple to implement (is_deleted boolean flag)

**Alternatives Considered**:
- **Hard delete**: Would break historical trade data or require complex cascade logic
- **Block deletion if trades exist**: Frustrating UX, prevents cleanup
- **Cascade delete strategy references**: Loses valuable historical categorization data

**Implementation**:
- Strategy list only shows active strategies (WHERE is_deleted = FALSE)
- Delete endpoint sets is_deleted = TRUE
- Trade forms only allow selection of active strategies
- Trade display shows strategy name even if strategy is deleted (read historical data)

### 6. Duplicate Name Prevention

**Decision**: Database unique constraint on (account_id, name) for active strategies

**Rationale**:
- Prevents confusion when selecting strategies
- Enforces data quality at database level (cannot bypass in code)
- Account-scoped to allow different users to have same strategy names

**Alternatives Considered**:
- **Application-level validation only**: Can be bypassed, race conditions possible
- **Case-insensitive uniqueness**: Adds complexity, different database collations behave differently
- **No duplicate prevention**: Confusing UX, error-prone strategy selection

**Implementation**:
```csharp
public void Configure(EntityTypeBuilder<Strategy> builder)
{
    builder.HasIndex(s => new { s.AccountId, s.Name })
           .IsUnique()
           .HasFilter("is_deleted = FALSE");  // Only active strategies
}
```

### 7. Frontend Library Structure

**Decision**: Feature-based architecture within strategies library (data-access, ui, feature folders)

**Rationale**:
- Follows Nx best practices for library organization
- Separates concerns: state management, reusable UI, smart components
- Enables code reuse (strategy-selector component used in trades lib)
- Clear boundaries for testing

**Alternatives Considered**:
- **Flat structure**: Harder to navigate, poor separation of concerns
- **Component-first organization**: Harder to find related logic
- **Domain-driven structure**: Overkill for this feature size

**Structure**:
```
libs/strategies/src/lib/strategies/
├── data-access/              # State management + API calls
│   ├── strategies.store.ts
│   ├── strategies.service.ts
│   └── models/
│       └── strategy.model.ts
├── ui/                       # Presentational components (PrimeNG-based)
│   ├── strategy-form/
│   ├── strategy-list/
│   └── strategy-selector/    # Reusable dropdown component
└── feature/                  # Smart components + routing
    ├── strategy-shell/
    └── strategies-routes.ts
```

### 8. API Design

**Decision**: RESTful API with standard CRUD operations

**Rationale**:
- Aligns with existing Invenet API patterns
- Simple, well-understood REST semantics
- Easy to document with OpenAPI/Swagger
- Frontend HTTP client libraries work seamlessly

**Alternatives Considered**:
- **GraphQL**: Overkill for simple CRUD, adds complexity
- **gRPC**: No browser support without proxy, unnecessary for this use case
- **Custom RPC**: Non-standard, harder for frontend to consume

**Endpoints**:
```
GET    /api/strategies          # List all strategies for account
GET    /api/strategies/{id}     # Get single strategy
POST   /api/strategies          # Create new strategy
PUT    /api/strategies/{id}     # Update existing strategy
DELETE /api/strategies/{id}     # Soft delete strategy
```

### 9. Trade API Modifications

**Decision**: Add optional `strategyId` field to existing trade create/update DTOs

**Rationale**:
- Backward compatible (field is optional)
- Minimal changes to existing trade endpoints
- Clear intent in API contract

**Alternatives Considered**:
- **Separate endpoint for strategy assignment**: More HTTP calls, poorer UX
- **Embed full strategy object in trade**: Denormalization, data inconsistency risk

**Changes**:
```csharp
public record CreateTradeRequest(
    // existing fields...
    Guid? StrategyId  // NEW: optional
);

public record TradeResponse(
    // existing fields...
    Guid? StrategyId,          // NEW
    string? StrategyName       // NEW: for display convenience
);
```

### 10. Testing Strategy

**Decision**: Unit tests for logic, integration tests for database, E2E for critical user flows

**Rationale**:
- Aligns with existing Invenet testing practices
- Unit tests: fast feedback, test business logic in isolation
- Integration tests: verify EF Core mappings and database constraints
- E2E tests: verify complete user workflows work end-to-end

**Alternatives Considered**:
- **Only E2E tests**: Slow, hard to debug, insufficient coverage
- **Only unit tests**: Miss integration issues, database constraint violations
- **Contract testing**: Useful but not critical for monolith architecture

**Test Scopes**:
- **Frontend Unit (Vitest)**: Store methods, service logic, component logic
- **Backend Unit (xUnit)**: Handler logic, validation, business rules
- **Backend Integration**: Database operations, EF Core queries, constraint enforcement
- **E2E (Playwright)**: Create strategy → assign to trade → filter trades by strategy

## Best Practices & Patterns

### Error Handling

**Frontend**:
- Use SignalStore error state for API failures
- PrimeNG toast notifications for user feedback
- Form validation with reactive forms

**Backend**:
- Return appropriate HTTP status codes (400, 404, 409, 500)
- Use ProblemDetails for structured error responses
- Log exceptions with context for debugging

### Validation

**Frontend**:
- Required field validation (name)
- Max length enforcement (200 characters for name)
- Trim whitespace before submission

**Backend**:
- FluentValidation for request DTOs (if available, else manual validation)
- Database constraint enforcement (unique constraint, foreign keys)
- Business rule validation (e.g., can't delete strategy if used by trades AND user hasn't confirmed)

### Performance

**Database**:
- Index on trades.strategy_id for efficient filtering
- Composite unique index on (account_id, name) for duplicate prevention
- Limit strategy list queries to active strategies only

**Frontend**:
- Cache strategy list in SignalStore (avoid repeated API calls)
- Optimize strategy selector with virtual scrolling if >100 items
- Debounce search/filter inputs

## Open Questions

None - all technical context is clarified.

## References

- [Invenet AGENTS.md](../../../AGENTS.md) - Tech stack overview
- [Module Template](../../../apps/api/MODULE_TEMPLATE.md) - Backend module structure
- [Nx Best Practices](https://nx.dev/core-features/enforce-module-boundaries) - Frontend library organization
- [PrimeNG Documentation](https://primeng.org/) - UI component reference
- [NgRx SignalStore Guide](../../../docs/NGRX_SIGNALSTORE_GUIDE.md) - State management patterns
