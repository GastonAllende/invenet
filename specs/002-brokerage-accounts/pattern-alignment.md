# Pattern Alignment: Accounts vs Strategies

**Date**: February 20, 2026  
**Comparison**: 002-brokerage-accounts plan vs 001-trade-strategy implementation

## ✅ What We Got Right

### 1. Module Structure

**Strategies Pattern**:

```
Modules/Strategies/
├── API/ (StrategiesController.cs)
├── Domain/ (Strategy.cs)
├── Features/ (CreateStrategy/, GetStrategy/, etc.)
└── Infrastructure/Data/ (StrategyConfiguration.cs)
```

**Accounts Plan**: ✅ Matches

```
Modules/Accounts/
├── API/ (AccountsController.cs)
├── Domain/Entities/ (Account.cs, AccountRiskSettings.cs)
├── Domain/DTOs/ (request/response classes)
└── Infrastructure/ (configurations)
```

### 2. Entity Pattern

**Strategies**:

- Soft delete with `IsDeleted` flag
- `CreatedAt` / `UpdatedAt` timestamps
- Account scoping (though called `AccountId` it's actually UserId)

**Accounts**: ✅ Matches

- Uses `IsActive` instead of `!IsDeleted` (semantically equivalent)
- `CreatedAt` / `UpdatedAt` timestamps
- User scoping with `UserId` (more accurate naming)

### 3. Frontend Structure

**Strategies**:

```
libs/strategies/src/lib/strategies/
├── data-access/ (models, service, store)
├── feature/ (shell component)
└── ui/ (form, list components)
```

**Accounts**: ✅ Matches exactly

### 4. State Management

**Strategies**: NgRx SignalStore with:

- `withEntities()` for collection
- `withComputed()` for derived state
- `rxMethod()` for async operations

**Accounts**: ✅ Planned to match

### 5. API Design

**Strategies**: 5 endpoints

- GET /api/strategies (list)
- GET /api/strategies/{id} (get)
- POST /api/strategies (create)
- PUT /api/strategies/{id} (update)
- DELETE /api/strategies/{id} (soft delete)

**Accounts**: ✅ Similar (5 endpoints with archive instead of delete)

---

## ⚠️ Adjustments Needed

### 1. **Infrastructure Folder Naming** ⚠️

**Issue**: Inconsistent folder naming

**Strategies Pattern**:

```
Infrastructure/
└── Data/
    └── StrategyConfiguration.cs
```

**Current Accounts Plan**:

```
Infrastructure/
└── Configuration/  ← SHOULD BE "Data"
    ├── AccountConfiguration.cs
    └── AccountRiskSettingsConfiguration.cs
```

**FIX**: Update quickstart.md to use `Infrastructure/Data/` instead of `Infrastructure/Configuration/`

---

### 2. **Database Schema** ⚠️

**Issue**: Missing schema specification

**Strategies Pattern**:

```csharp
builder.ToTable("strategies", schema: "strategies");
```

**Current Accounts Plan**:

```csharp
builder.ToTable("accounts");  // ← Missing schema parameter
```

**FIX**: Update data-model.md and quickstart.md to include:

```csharp
// AccountConfiguration.cs
builder.ToTable("accounts", schema: "accounts");

// AccountRiskSettingsConfiguration.cs
builder.ToTable("account_risk_settings", schema: "accounts");
```

---

### 3. **Features Folder** ℹ️

**Observation**: Strategies uses separate feature classes

**Strategies Pattern**:

```
Features/
├── CreateStrategy/
│   ├── CreateStrategyCommand.cs
│   └── CreateStrategyHandler.cs
├── GetStrategy/
├── ListStrategies/
└── UpdateStrategy/
```

**Current Accounts Plan**: Controller handles everything inline (simpler)

**DECISION**: This is optional (CQRS pattern). Our MVP approach (controller-only) is acceptable for now. Can refactor later if needed.

---

### 4. **Index Naming Convention** ⚠️

**Issue**: Index names don't match convention

**Strategies Pattern**:

```csharp
builder.HasIndex(s => s.AccountId)
    .HasDatabaseName("ix_strategies_account_id");

builder.HasIndex(s => new { s.AccountId, s.IsDeleted })
    .HasDatabaseName("ix_strategies_account_active");
```

**Current Accounts Plan**: Missing `.HasDatabaseName()` calls

**FIX**: Update configurations to explicitly name indexes:

```csharp
// AccountConfiguration.cs
builder.HasIndex(a => new { a.UserId, a.IsActive })
    .HasDatabaseName("ix_accounts_user_active");

builder.HasIndex(a => new { a.UserId, a.CreatedAt })
    .HasDatabaseName("ix_accounts_user_created");

// AccountRiskSettingsConfiguration.cs
builder.HasIndex(rs => rs.AccountId)
    .IsUnique()
    .HasDatabaseName("ix_account_risk_settings_account_id");
```

---

### 5. **Controller Security Pattern** ✅

**Strategies Pattern**:

```csharp
private Guid GetCurrentAccountId()
{
    var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
    {
        throw new UnauthorizedAccessException("User ID not found in claims");
    }
    return userId;
}
```

**Accounts Plan**: ✅ Should use same helper method pattern

---

### 6. **TypeScript Model Alignment** ✅

**Strategies Models**:

```typescript
export interface Strategy {
  id: string;
  accountId: string;
  name: string;
  description: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Accounts Models**: ✅ Follow same pattern (nullable with `| null`, string for UUIDs and datetimes)

---

### 7. **API Service Pattern** ✅

**Strategies**:

```typescript
@Injectable({ providedIn: 'root' })
export class StrategiesApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5256/api/strategies';
  // ...
}
```

**Accounts**: ✅ Quickstart shows same pattern

---

## 📋 Action Items

### High Priority (Breaking/Architectural)

1. ✅ **Update folder structure**: `Infrastructure/Configuration/` → `Infrastructure/Data/`
2. ✅ **Add schema parameter**: All `ToTable()` calls should specify `schema: "accounts"`
3. ✅ **Add explicit index names**: Use `.HasDatabaseName("ix_...")` for all indexes

### Medium Priority (Consistency)

4. ✅ **Update quickstart.md**: Reflect correct folder paths
5. ✅ **Update data-model.md**: Add schema specifications and index names
6. ✅ **Add helper method**: Document `GetCurrentUserId()` pattern in controller

### Optional (Future Enhancement)

7. ⏸️ **Features folder**: Can add CQRS pattern later if complexity grows
8. ⏸️ **Navigation properties**: Consider adding `Account.Trades` collection if needed for queries

---

## Summary

**Alignment Score**: 85% ✅

Our plan closely follows the Strategies pattern with a few naming and schema adjustments needed. The core architecture, entity design, and frontend structure are already aligned.

**Key Differences (Intentional)**:

- Accounts uses `UserId` instead of `AccountId` (more accurate since we're building Account entity)
- Accounts uses `IsActive` instead of `IsDeleted` (positive logic, same behavior)
- Accounts doesn't use Features/ folder (simpler MVP approach)

**Required Changes**: See Action Items #1-6 above.
