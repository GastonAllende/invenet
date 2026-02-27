# Quickstart Guide: Brokerage Accounts Feature

## Prerequisites

Before implementing this feature, ensure you have:

1. ✅ PostgreSQL running locally
2. ✅ .NET 10 SDK installed
3. ✅ Node.js 20+ installed
4. ✅ Dependencies installed (`npm install`, `dotnet restore`)
5. ✅ Reviewed `/specs/002-brokerage-accounts/spec.md`
6. ✅ Reviewed `/specs/002-brokerage-accounts/data-model.md`
7. ✅ Reviewed `/specs/002-brokerage-accounts/contracts/AccountsOpenAPI.yaml`

## Architecture Overview

This feature follows the **Modular Monolith** pattern established in Phase 3 (Trade Strategies):

```
Backend (apps/Invenet.Api/)
├── Modules/
│   └── Accounts/                    # New module
│       ├── API/
│       │   └── AccountsController.cs
│       ├── Domain/
│       │   ├── Entities/
│       │   │   ├── Account.cs
│       │   │   └── AccountRiskSettings.cs
│       │   └── DTOs/
│       │       ├── CreateAccountRequest.cs
│       │       ├── UpdateAccountRequest.cs
│       │       ├── GetAccountResponse.cs
│       │       ├── RiskSettingsDto.cs
│       │       └── ListAccountsResponse.cs
│       └── Infrastructure/
│           └── Data/
│               ├── AccountConfiguration.cs
│               └── AccountRiskSettingsConfiguration.cs

Frontend (libs/accounts/)
├── data-access/
│   ├── src/lib/
│   │   ├── models/account.model.ts
│   │   ├── services/accounts-api.service.ts
│   │   └── store/accounts.store.ts
├── feature/
│   └── src/lib/
│       ├── accounts-shell.component.ts
│       └── routes.ts
└── ui/
    └── src/lib/
        ├── account-form/account-form.component.ts
        └── account-list/account-list.component.ts
```

## Implementation Steps

### Backend: Step 1 - Create Domain Entities

**File:** `apps/Invenet.Api/Modules/Accounts/Domain/Entities/Account.cs`

```csharp
using System;
using System.ComponentModel.DataAnnotations;

namespace Invenet.Api.Modules.Accounts.Domain.Entities;

public class Account
{
    public Guid Id { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Broker { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string AccountType { get; set; } = string.Empty;

    [Required]
    [MaxLength(3)]
    public string BaseCurrency { get; set; } = string.Empty;

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public decimal StartingBalance { get; set; }

    [MaxLength(50)]
    public string Timezone { get; set; } = "Europe/Stockholm";

    public string? Notes { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public AccountRiskSettings? RiskSettings { get; set; }
}
```

**File:** `apps/Invenet.Api/Modules/Accounts/Domain/Entities/AccountRiskSettings.cs`

```csharp
using System;
using System.ComponentModel.DataAnnotations;

namespace Invenet.Api.Modules.Accounts.Domain.Entities;

public class AccountRiskSettings
{
    public Guid Id { get; set; }

    [Required]
    public Guid AccountId { get; set; }

    [Required]
    [Range(0, 100)]
    public decimal RiskPerTradePct { get; set; }

    [Required]
    [Range(0, 100)]
    public decimal MaxDailyLossPct { get; set; }

    [Required]
    [Range(0, 100)]
    public decimal MaxWeeklyLossPct { get; set; }

    public bool EnforceLimits { get; set; } = false;

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public Account Account { get; set; } = null!;
}
```

### Backend: Step 2 - Configure EF Core

**File:** `apps/Invenet.Api/Modules/Accounts/Infrastructure/Data/AccountConfiguration.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Invenet.Api.Modules.Accounts.Domain.Entities;

namespace Invenet.Api.Modules.Accounts.Infrastructure.Data;

public class AccountConfiguration : IEntityTypeConfiguration<Account>
{
    public void Configure(EntityTypeBuilder<Account> builder)
    {
        builder.ToTable("accounts", schema: "accounts");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Id)
            .HasColumnName("id")
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(a => a.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.Property(a => a.Name)
            .HasColumnName("name")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(a => a.Broker)
            .HasColumnName("broker")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(a => a.AccountType)
            .HasColumnName("account_type")
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(a => a.BaseCurrency)
            .HasColumnName("base_currency")
            .HasMaxLength(3)
            .IsRequired();

        builder.Property(a => a.StartDate)
            .HasColumnName("start_date")
            .IsRequired();

        builder.Property(a => a.StartingBalance)
            .HasColumnName("starting_balance")
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(a => a.Timezone)
            .HasColumnName("timezone")
            .HasMaxLength(50)
            .HasDefaultValue("Europe/Stockholm");

        builder.Property(a => a.Notes)
            .HasColumnName("notes")
            .HasColumnType("text");

        builder.Property(a => a.IsActive)
            .HasColumnName("is_active")
            .HasDefaultValue(true);

        builder.Property(a => a.CreatedAt)
            .HasColumnName("created_at")
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.Property(a => a.UpdatedAt)
            .HasColumnName("updated_at")
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        // Relationships
        builder.HasOne(a => a.RiskSettings)
            .WithOne(rs => rs.Account)
            .HasForeignKey<AccountRiskSettings>(rs => rs.AccountId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(a => new { a.UserId, a.IsActive })
            .HasDatabaseName("ix_accounts_user_active");
        builder.HasIndex(a => new { a.UserId, a.CreatedAt })
            .HasDatabaseName("ix_accounts_user_created");
    }
}
```

**File:** `apps/Invenet.Api/Modules/Accounts/Infrastructure/Data/AccountRiskSettingsConfiguration.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Invenet.Api.Modules.Accounts.Domain.Entities;

namespace Invenet.Api.Modules.Accounts.Infrastructure.Data;

public class AccountRiskSettingsConfiguration : IEntityTypeConfiguration<AccountRiskSettings>
{
    public void Configure(EntityTypeBuilder<AccountRiskSettings> builder)
    {
        builder.ToTable("account_risk_settings", schema: "accounts");

        builder.HasKey(rs => rs.Id);

        builder.Property(rs => rs.Id)
            .HasColumnName("id")
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(rs => rs.AccountId)
            .HasColumnName("account_id")
            .IsRequired();

        builder.Property(rs => rs.RiskPerTradePct)
            .HasColumnName("risk_per_trade_pct")
            .HasColumnType("decimal(5,2)")
            .IsRequired();

        builder.Property(rs => rs.MaxDailyLossPct)
            .HasColumnName("max_daily_loss_pct")
            .HasColumnType("decimal(5,2)")
            .IsRequired();

        builder.Property(rs => rs.MaxWeeklyLossPct)
            .HasColumnName("max_weekly_loss_pct")
            .HasColumnType("decimal(5,2)")
            .IsRequired();

        builder.Property(rs => rs.EnforceLimits)
            .HasColumnName("enforce_limits")
            .HasDefaultValue(false);

        builder.Property(rs => rs.CreatedAt)
            .HasColumnName("created_at")
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.Property(rs => rs.UpdatedAt)
            .HasColumnName("updated_at")
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        // Indexes
        builder.HasIndex(rs => rs.AccountId)
            .IsUnique()
            .HasDatabaseName("ix_account_risk_settings_account_id");
    }
}
```

### Backend: Step 3 - Create Migration

```bash
cd apps/Invenet.Api
dotnet ef migrations add AddAccountsModule --context InvenetDbContext
```

**Verify migration file** at `apps/Invenet.Api/Migrations/<timestamp>_AddAccountsModule.cs` includes:

- `accounts` table creation
- `account_risk_settings` table creation
- Foreign key constraint (account_id → accounts.id)
- Composite indexes on (user_id, is_active) and (user_id, created_at)
- Unique index on account_risk_settings.account_id

### Backend: Step 4 - Apply Migration

```bash
dotnet ef database update
```

**Verify tables exist:**

```sql
\dt accounts*
-- Should show: accounts, account_risk_settings
```

### Backend: Step 5 - Create DTOs

See `data-model.md` for complete DTO definitions. Key files:

- `CreateAccountRequest.cs`
- `UpdateAccountRequest.cs`
- `GetAccountResponse.cs`
- `RiskSettingsDto.cs`
- `ListAccountsResponse.cs`

### Backend: Step 6 - Create API Controller

**File:** `apps/Invenet.Api/Modules/Accounts/API/AccountsController.cs`

Implement 5 endpoints:

1. `GET /api/accounts` → List accounts
2. `GET /api/accounts/{id}` → Get single account
3. `POST /api/accounts` → Create account
4. `PUT /api/accounts/{id}` → Update account
5. `POST /api/accounts/{id}/archive` → Archive account

**Reference:** `/apps/Invenet.Api/Modules/Strategies/API/StrategiesController.cs`

### Backend: Step 7 - Register DbContext

**File:** `apps/Invenet.Api/Data/InvenetDbContext.cs`

```csharp
using Invenet.Api.Modules.Accounts.Domain.Entities;
using Invenet.Api.Modules.Accounts.Infrastructure.Configuration;

// Add DbSets
public DbSet<Account> Accounts => Set<Account>();
public DbSet<AccountRiskSettings> AccountRiskSettings => Set<AccountRiskSettings>();

// Apply configurations
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    // ... existing configurations
    modelBuilder.ApplyConfiguration(new AccountConfiguration());
    modelBuilder.ApplyConfiguration(new AccountRiskSettingsConfiguration());
}
```

### Backend: Step 8 - Test Backend API

```bash
cd apps/Invenet.Api
dotnet watch run
```

**Test endpoints with curl:**

```bash
# 1. Login to get JWT token
curl -X POST http://localhost:5256/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"YourPassword123!"}'

# 2. Create account
curl -X POST http://localhost:5256/api/accounts \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "IBKR Main Account",
    "broker": "Interactive Brokers (IBKR)",
    "accountType": "Margin",
    "baseCurrency": "USD",
    "startDate": "2026-01-01T00:00:00Z",
    "startingBalance": 10000.00,
    "timezone": "America/New_York",
    "riskSettings": {
      "riskPerTradePct": 1.5,
      "maxDailyLossPct": 3.0,
      "maxWeeklyLossPct": 6.0,
      "enforceLimits": false
    }
  }'

# 3. List accounts
curl -X GET http://localhost:5256/api/accounts \
  -H "Authorization: Bearer <your-jwt-token>"

# 4. Get single account
curl -X GET http://localhost:5256/api/accounts/{account-id} \
  -H "Authorization: Bearer <your-jwt-token>"

# 5. Archive account
curl -X POST http://localhost:5256/api/accounts/{account-id}/archive \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

## Frontend Implementation

### Frontend: Step 1 - Create TypeScript Models

**File:** `libs/accounts/data-access/src/lib/models/account.model.ts`

See `data-model.md` for complete TypeScript interfaces:

- `Account`
- `AccountRiskSettings`
- `CreateAccountRequest`
- `UpdateAccountRequest`
- `GetAccountResponse`
- `AccountType` enum
- `RiskSettingsDto`

### Frontend: Step 2 - Create API Service

**File:** `libs/accounts/data-access/src/lib/services/accounts-api.service.ts`

```typescript
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateAccountRequest, GetAccountResponse, UpdateAccountRequest } from '../models/account.model';

@Injectable({ providedIn: 'root' })
export class AccountsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5256/api/accounts';

  listAccounts(includeArchived = false): Observable<{ accounts: GetAccountResponse[]; total: number }> {
    const params = { includeArchived: includeArchived.toString() };
    return this.http.get<{ accounts: GetAccountResponse[]; total: number }>(this.apiUrl, { params });
  }

  getAccount(id: string): Observable<GetAccountResponse> {
    return this.http.get<GetAccountResponse>(`${this.apiUrl}/${id}`);
  }

  createAccount(request: CreateAccountRequest): Observable<GetAccountResponse> {
    return this.http.post<GetAccountResponse>(this.apiUrl, request);
  }

  updateAccount(id: string, request: UpdateAccountRequest): Observable<GetAccountResponse> {
    return this.http.put<GetAccountResponse>(`${this.apiUrl}/${id}`, request);
  }

  archiveAccount(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/archive`, {});
  }
}
```

### Frontend: Step 3 - Create NgRx SignalStore

**File:** `libs/accounts/data-access/src/lib/store/accounts.store.ts`

**Reference:** `/libs/strategies/data-access/src/lib/store/strategies.store.ts`

Key features:

- `withEntities()` for account collection
- `withComputed()` for `activeAccounts`, `archivedAccounts`, `accountCount`
- `rxMethod()` for `loadAccounts`, `createAccount`, `updateAccount`, `archiveAccount`
- `withRequestStatus()` for loading states

### Frontend: Step 4 - Create UI Components

**Components:**

1. `AccountFormComponent` (libs/accounts/ui/) - Create/edit form with risk settings
2. `AccountListComponent` (libs/accounts/ui/) - Table with actions
3. `AccountsShellComponent` (libs/accounts/feature/) - Container routing component

**Use PrimeNG:**

- `InputText`, `Dropdown`, `Calendar`, `InputNumber`, `Checkbox`, `Button`, `Table`

### Frontend: Step 5 - Add Routes

**File:** `apps/invenet/src/app/app.routes.ts`

```typescript
{
  path: 'accounts',
  loadChildren: () =>
    import('@invenet/accounts/feature').then((m) => m.accountsRoutes),
}
```

**File:** `libs/accounts/feature/src/lib/routes.ts`

```typescript
import { Route } from '@angular/router';
import { AccountsShellComponent } from './accounts-shell.component';

export const accountsRoutes: Route[] = [
  {
    path: '',
    component: AccountsShellComponent,
  },
];
```

### Frontend: Step 6 - Test Frontend

```bash
# Terminal 1: Backend
cd apps/Invenet.Api
dotnet watch run

# Terminal 2: Frontend
npx nx serve invenet
```

**Navigate to:** `http://localhost:4200/accounts`

**Test user flows:**

1. ✅ Create new account with risk settings
2. ✅ View accounts list
3. ✅ Edit existing account
4. ✅ Archive account (soft delete)
5. ✅ Validation errors display correctly

---

## Testing

### Backend Unit Tests

**File:** `apps/Invenet.Test/Modules/Accounts/AccountsControllerTests.cs`

Test scenarios:

- POST /accounts with valid data → 201 Created
- POST /accounts with invalid balance → 400 Bad Request
- GET /accounts → 200 OK with embedded risk settings
- PUT /accounts/{id} → 200 OK with updated data
- POST /accounts/{id}/archive → 200 OK + is_active = false

### Frontend Component Tests

**File:** `libs/accounts/ui/src/lib/account-form/account-form.component.spec.ts`

Test scenarios:

- Form loads with default values
- Validation errors for required fields
- Risk settings validation (0-100% range)
- Submit emits CreateAccountRequest

---

## Verification Checklist

After implementation, verify:

### Backend ✅

- [ ] Tables `accounts` and `account_risk_settings` exist in PostgreSQL
- [ ] Migration applied successfully
- [ ] All 5 endpoints return expected responses
- [ ] JWT authentication required for all endpoints
- [ ] Validation errors returned for invalid input
- [ ] Cascade delete works (delete account → delete risk settings)
- [ ] Indexes improve query performance

### Frontend ✅

- [ ] `/accounts` route renders AccountsShellComponent
- [ ] Account list displays with PrimeNG Table
- [ ] Create form validates all required fields
- [ ] Risk settings percentages validated (0-100)
- [ ] Edit form pre-fills with existing data
- [ ] Archive soft-deletes account (is_active = false)
- [ ] NgRx SignalStore updates UI reactively

### Integration ✅

- [ ] Frontend → Backend communication works
- [ ] JWT tokens passed in Authorization header
- [ ] CORS configured correctly
- [ ] Error messages displayed to user

---

## Troubleshooting

### Database Connection Failed

```bash
# Verify PostgreSQL is running
pg_isready

# Check connection string in appsettings.Development.json
cat apps/Invenet.Api/appsettings.Development.json | grep ConnectionStrings
```

### Migration Not Applied

```bash
# Check pending migrations
cd apps/Invenet.Api
dotnet ef migrations list

# Reapply migration
dotnet ef database update
```

### CORS Errors

Check `apps/Invenet.Api/Program.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularDev", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
```

### 401 Unauthorized

```bash
# Verify JWT token not expired
# Re-login to get new token
curl -X POST http://localhost:5256/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"YourPassword123!"}'
```

---

## Next Steps

After completing this feature:

1. **Run full test suite:**

   ```bash
   npx nx test invenet
   cd apps/Invenet.Api && dotnet test
   ```

2. **Run E2E tests:**

   ```bash
   npx nx e2e invenet-e2e
   ```

3. **Review code against checklist:**
   - See `/docs/CODE_REVIEW_CHECKLIST.md`

4. **Update documentation:**
   - Update `/AGENTS.md` with new routes
   - Update `/apps/invenet/AGENT.md` with accounts library

5. **Merge to main:**
   ```bash
   git add .
   git commit -m "feat: add brokerage accounts CRUD (002-brokerage-accounts)"
   git checkout main
   git merge 002-brokerage-accounts
   ```

---

## Reference Documentation

- Feature Spec: `/specs/002-brokerage-accounts/spec.md`
- Data Model: `/specs/002-brokerage-accounts/data-model.md`
- API Contract: `/specs/002-brokerage-accounts/contracts/AccountsOpenAPI.yaml`
- Backend Architecture: `/apps/api/MODULAR_MONOLITH.md`
- Frontend Best Practices: `/docs/ANGULAR_BEST_PRACTICES.md`
- NgRx SignalStore Guide: `/docs/NGRX_SIGNALSTORE_GUIDE.md`
