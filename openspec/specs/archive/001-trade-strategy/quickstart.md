# Quickstart: Trade Strategy Association

**Date**: February 18, 2026  
**Feature Branch**: `001-trade-strategy`

Quick developer guide for implementing the Trade Strategy Association feature. Follow this guide for the technical implementation after the plan has been approved.

## Prerequisites

- Feature spec approved: [spec.md](./spec.md)
- Technical plan reviewed: [plan.md](./plan.md)
- Data model understood: [data-model.md](./data-model.md)
- API contract reviewed: [contracts/strategies-api.yaml](./contracts/strategies-api.yaml)
- Development environment set up (see [AGENTS.md](../../../AGENTS.md))

## Implementation Order

Follow this sequence to minimize merge conflicts and ensure testability at each step:

1. **Backend: Database & Domain** (30min)
2. **Backend: API Endpoints** (45min)
3. **Backend: Tests** (30min)
4. **Frontend: Models & Services** (20min)
5. **Frontend: Strategy Management UI** (60min)
6. **Frontend: Trade Integration** (40min)
7. **Frontend: Tests** (30min)
8. **E2E Tests** (30min)

**Total estimated time**: ~4-5 hours for experienced developer

---

## Phase 1: Backend Database & Domain (30min)

### 1.1 Create Database Migration

```bash
cd apps/api/Invenet.Api
dotnet ef migrations add AddStrategiesAndTradeStrategyRelation
```

The migration should include:

- Create `strategies.strategies` table
- Add `strategy_id` column to `trades.trades` table
- Add indexes and constraints (see [data-model.md](./data-model.md#database-schema-postgresql))

### 1.2 Create Domain Entity

Create `apps/api/Invenet.Api/Modules/Strategies/Domain/Strategy.cs`:

```csharp
using Invenet.Api.Modules.Shared.Domain;

namespace Invenet.Api.Modules.Strategies.Domain;

public class Strategy : BaseEntity
{
    public Guid Id { get; set; }
    public Guid AccountId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public Account Account { get; set; } = null!;
    public ICollection<Trade> Trades { get; set; } = new List<Trade>();
}
```

### 1.3 Create EF Core Configuration

Create `apps/api/Invenet.Api/Modules/Strategies/Infrastructure/Data/StrategyConfiguration.cs`:

```csharp
using Invenet.Api.Modules.Strategies.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Invenet.Api.Modules.Strategies.Infrastructure.Data;

public class StrategyConfiguration : IEntityTypeConfiguration<Strategy>
{
    public void Configure(EntityTypeBuilder<Strategy> builder)
    {
        builder.ToTable("strategies", schema: "strategies");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Name)
               .IsRequired()
               .HasMaxLength(200);

        builder.Property(s => s.Description)
               .HasMaxLength(2000);

        builder.Property(s => s.IsDeleted)
               .IsRequired()
               .HasDefaultValue(false);

        builder.Property(s => s.CreatedAt)
               .IsRequired();

        builder.Property(s => s.UpdatedAt)
               .IsRequired();

        // Unique constraint for active strategy names per account
        builder.HasIndex(s => new { s.AccountId, s.Name })
               .IsUnique()
               .HasFilter("is_deleted = FALSE");

        // Foreign key to Account
        builder.HasOne(s => s.Account)
               .WithMany()
               .HasForeignKey(s => s.AccountId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
```

### 1.4 Update Trade Entity

Modify `apps/api/Invenet.Api/Modules/Trades/Domain/Trade.cs`:

```csharp
// Add these properties
public Guid? StrategyId { get; set; }
public Strategy? Strategy { get; set; }
```

### 1.5 Update DbContext

Add to `ApplicationDbContext.cs` (or wherever EF configurations are registered):

```csharp
modelBuilder.ApplyConfiguration(new StrategyConfiguration());
```

### 1.6 Run Migration

```bash
dotnet ef database update
```

**Checkpoint**: Database should now have strategies table and trades.strategy_id column.

---

## Phase 2: Backend API Endpoints (45min)

### 2.1 Create DTOs

Create feature request/response files in `apps/api/Invenet.Api/Modules/Strategies/Features/`:

**CreateStrategy/CreateStrategyRequest.cs**:

```csharp
namespace Invenet.Api.Modules.Strategies.Features.CreateStrategy;

public record CreateStrategyRequest(string Name, string? Description = null);
```

**CreateStrategy/CreateStrategyResponse.cs**:

```csharp
namespace Invenet.Api.Modules.Strategies.Features.CreateStrategy;

public record CreateStrategyResponse(
    Guid Id,
    string Name,
    string? Description,
    bool IsDeleted,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
```

Repeat for: `UpdateStrategy`, `GetStrategy`, `ListStrategies`, `DeleteStrategy`

### 2.2 Create Controller

Create `apps/api/Invenet.Api/Modules/Strategies/API/StrategiesController.cs`:

```csharp
using Invenet.Api.Modules.Strategies.Features.CreateStrategy;
using Invenet.Api.Modules.Strategies.Features.UpdateStrategy;
using Invenet.Api.Modules.Strategies.Features.GetStrategy;
using Invenet.Api.Modules.Strategies.Features.ListStrategies;
using Invenet.Api.Modules.Strategies.Features.DeleteStrategy;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Invenet.Api.Modules.Strategies.API;

[ApiController]
[Route("api/strategies")]
[Authorize]
public class StrategiesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public StrategiesController(
        ApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<StrategyResponse>>> List(
        [FromQuery] bool includeDeleted = false)
    {
        var accountId = _currentUserService.AccountId;

        var query = _context.Strategies.Where(s => s.AccountId == accountId);

        if (!includeDeleted)
        {
            query = query.Where(s => !s.IsDeleted);
        }

        var strategies = await query
            .OrderBy(s => s.Name)
            .Select(s => new StrategyResponse(
                s.Id,
                s.Name,
                s.Description,
                s.IsDeleted,
                s.CreatedAt,
                s.UpdatedAt
            ))
            .ToListAsync();

        return Ok(strategies);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<StrategyResponse>> Get(Guid id)
    {
        var accountId = _currentUserService.AccountId;

        var strategy = await _context.Strategies
            .Where(s => s.Id == id && s.AccountId == accountId)
            .Select(s => new StrategyResponse(
                s.Id,
                s.Name,
                s.Description,
                s.IsDeleted,
                s.CreatedAt,
                s.UpdatedAt
            ))
            .FirstOrDefaultAsync();

        if (strategy == null)
        {
            return NotFound();
        }

        return Ok(strategy);
    }

    [HttpPost]
    public async Task<ActionResult<StrategyResponse>> Create(
        [FromBody] CreateStrategyRequest request)
    {
        var accountId = _currentUserService.AccountId;

        // Validate
        var trimmedName = request.Name?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(trimmedName))
        {
            return BadRequest("Name is required");
        }

        // Check for duplicate
        var exists = await _context.Strategies
            .AnyAsync(s => s.AccountId == accountId
                        && s.Name == trimmedName
                        && !s.IsDeleted);

        if (exists)
        {
            return Conflict($"A strategy with the name '{trimmedName}' already exists");
        }

        var strategy = new Strategy
        {
            Id = Guid.NewGuid(),
            AccountId = accountId,
            Name = trimmedName,
            Description = request.Description?.Trim(),
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Strategies.Add(strategy);
        await _context.SaveChangesAsync();

        var response = new StrategyResponse(
            strategy.Id,
            strategy.Name,
            strategy.Description,
            strategy.IsDeleted,
            strategy.CreatedAt,
            strategy.UpdatedAt
        );

        return CreatedAtAction(nameof(Get), new { id = strategy.Id }, response);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<StrategyResponse>> Update(
        Guid id,
        [FromBody] UpdateStrategyRequest request)
    {
        var accountId = _currentUserService.AccountId;

        var strategy = await _context.Strategies
            .FirstOrDefaultAsync(s => s.Id == id && s.AccountId == accountId);

        if (strategy == null)
        {
            return NotFound();
        }

        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            var trimmedName = request.Name.Trim();

            // Check for duplicate (excluding current strategy)
            var exists = await _context.Strategies
                .AnyAsync(s => s.AccountId == accountId
                            && s.Name == trimmedName
                            && s.Id != id
                            && !s.IsDeleted);

            if (exists)
            {
                return Conflict($"A strategy with the name '{trimmedName}' already exists");
            }

            strategy.Name = trimmedName;
        }

        strategy.Description = request.Description?.Trim();
        strategy.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var response = new StrategyResponse(
            strategy.Id,
            strategy.Name,
            strategy.Description,
            strategy.IsDeleted,
            strategy.CreatedAt,
            strategy.UpdatedAt
        );

        return Ok(response);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var accountId = _currentUserService.AccountId;

        var strategy = await _context.Strategies
            .FirstOrDefaultAsync(s => s.Id == id && s.AccountId == accountId);

        if (strategy == null)
        {
            return NotFound();
        }

        // Soft delete
        strategy.IsDeleted = true;
        strategy.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }
}
```

### 2.3 Register Module

Create `apps/api/Invenet.Api/Modules/Strategies/StrategiesModule.cs`:

```csharp
using Invenet.Api.Modules.Shared.Contracts;

namespace Invenet.Api.Modules.Strategies;

public class StrategiesModule : IModule
{
    public IServiceCollection RegisterModule(IServiceCollection services, IConfiguration configuration)
    {
        // Services registered here if needed
        return services;
    }

    public IEndpointRouteBuilder MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        // Controller endpoints mapped automatically
        return endpoints;
    }
}
```

Register in `Program.cs` or module loader.

**Checkpoint**: Run backend, test API endpoints with Swagger/Postman.

---

## Phase 3: Backend Tests (30min)

Create `apps/api/Invenet.Test/Modules/Strategies/StrategiesControllerTests.cs`:

```csharp
// Unit tests for controller actions
// Integration tests for database operations
// Test cases: create, duplicate name, update, delete, list
```

**Checkpoint**: All backend tests passing (`dotnet test`).

---

## Phase 4: Frontend Models & Services (20min)

### 4.1 Create Models

Create `libs/strategies/src/lib/strategies/data-access/models/strategy.model.ts`:

```typescript
export interface Strategy {
  id: string;
  name: string;
  description?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStrategyDto {
  name: string;
  description?: string;
}

export interface UpdateStrategyDto {
  name?: string;
  description?: string;
}
```

### 4.2 Create API Service

Create `libs/strategies/src/lib/strategies/data-access/strategies.service.ts`:

```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Strategy, CreateStrategyDto, UpdateStrategyDto } from './models/strategy.model';

@Injectable({ providedIn: 'root' })
export class StrategiesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/strategies';

  list(): Observable<Strategy[]> {
    return this.http.get<Strategy[]>(this.apiUrl);
  }

  get(id: string): Observable<Strategy> {
    return this.http.get<Strategy>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateStrategyDto): Observable<Strategy> {
    return this.http.post<Strategy>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdateStrategyDto): Observable<Strategy> {
    return this.http.put<Strategy>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

### 4.3 Create SignalStore

Create `libs/strategies/src/lib/strategies/data-access/strategies.store.ts`:

```typescript
import { signalStore, withState, withMethods } from '@ngrx/signals';
import { inject } from '@angular/core';
import { StrategiesService } from './strategies.service';
import { Strategy } from './models/strategy.model';

export interface StrategiesState {
  strategies: Strategy[];
  selectedStrategy: Strategy | null;
  loading: boolean;
  error: string | null;
}

const initialState: StrategiesState = {
  strategies: [],
  selectedStrategy: null,
  loading: false,
  error: null,
};

export const StrategiesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, strategiesService = inject(StrategiesService)) => ({
    async loadStrategies() {
      patchState(store, { loading: true, error: null });
      try {
        const strategies = await firstValueFrom(strategiesService.list());
        patchState(store, { strategies, loading: false });
      } catch (error) {
        patchState(store, { error: 'Failed to load strategies', loading: false });
      }
    },

    async createStrategy(dto: CreateStrategyDto) {
      patchState(store, { loading: true, error: null });
      try {
        const strategy = await firstValueFrom(strategiesService.create(dto));
        patchState(store, {
          strategies: [...store.strategies(), strategy],
          loading: false,
        });
        return strategy;
      } catch (error) {
        patchState(store, { error: 'Failed to create strategy', loading: false });
        throw error;
      }
    },

    // Add update, delete methods similarly
  })),
);
```

**Checkpoint**: Services compile, can be injected in components.

---

## Phase 5: Frontend Strategy Management UI (60min)

### 5.1 Strategy List Component

Create `libs/strategies/src/lib/strategies/ui/strategy-list/strategy-list.component.ts`:

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { StrategiesStore } from '../../data-access/strategies.store';

@Component({
  selector: 'app-strategy-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  template: `
    <p-table [value]="store.strategies()" [loading]="store.loading()">
      <ng-template pTemplate="header">
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th>Actions</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-strategy>
        <tr>
          <td>{{ strategy.name }}</td>
          <td>{{ strategy.description }}</td>
          <td>
            <p-button icon="pi pi-pencil" (click)="edit(strategy)" />
            <p-button icon="pi pi-trash" severity="danger" (click)="delete(strategy)" />
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class StrategyListComponent implements OnInit {
  readonly store = inject(StrategiesStore);

  ngOnInit() {
    this.store.loadStrategies();
  }

  edit(strategy: Strategy) {
    // Open dialog
  }

  delete(strategy: Strategy) {
    // Confirm and delete
  }
}
```

### 5.2 Strategy Form Dialog

Create `libs/strategies/src/lib/strategies/ui/strategy-form/strategy-form.component.ts` using PrimeNG Dialog + Reactive Forms.

### 5.3 Strategy Selector (Reusable)

Create `libs/strategies/src/lib/strategies/ui/strategy-selector/strategy-selector.component.ts`:

```typescript
@Component({
  selector: 'app-strategy-selector',
  standalone: true,
  imports: [CommonModule, DropdownModule, FormsModule],
  template: ` <p-dropdown [options]="store.strategies()" [(ngModel)]="selectedStrategyId" (ngModelChange)="strategyChange.emit($event)" optionLabel="name" optionValue="id" [placeholder]="placeholder" [showClear]="!required" /> `,
})
export class StrategySelectorComponent implements OnInit {
  @Input() selectedStrategyId?: string | null;
  @Input() placeholder = 'Select strategy';
  @Input() required = false;
  @Output() strategyChange = new EventEmitter<string | null>();

  readonly store = inject(StrategiesStore);

  ngOnInit() {
    this.store.loadStrategies();
  }
}
```

**Checkpoint**: Can create, edit, delete strategies via UI.

---

## Phase 6: Frontend Trade Integration (40min)

### 6.1 Update Trade Model

Modify `libs/trades/src/lib/trades/data-access/models/trade.model.ts`:

```typescript
export interface Trade {
  // existing fields...
  strategyId?: string;
  strategyName?: string;
}

export interface CreateTradeDto {
  // existing fields...
  strategyId?: string;
}
```

### 6.2 Add Strategy Selector to Trade Form

Modify `libs/trades/src/lib/trades/ui/trade-form/trade-form.component.html`:

```html
<!-- Add after existing form fields -->
<div class="field">
  <label for="strategy">Strategy (Optional)</label>
  <app-strategy-selector [selectedStrategyId]="tradeForm.get('strategyId')?.value" (strategyChange)="tradeForm.patchValue({ strategyId: $event })" placeholder="Select a trading strategy" />
</div>
```

### 6.3 Add Strategy Column to Trade List

Modify `libs/trades/src/lib/trades/ui/trade-list/trade-list.component.html`:

```html
<p-column field="strategyName" header="Strategy"></p-column>
```

### 6.4 Add Strategy Filter

Add dropdown filter in trade list toolbar for filtering by strategy.

**Checkpoint**: Can assign strategies to trades, see strategy name in list, filter by strategy.

---

## Phase 7: Frontend Tests (30min)

Create unit tests using Vitest:

- `strategy-list.component.spec.ts`
- `strategy-form.component.spec.ts`
- `strategy-selector.component.spec.ts`
- `strategies.service.spec.ts`
- `strategies.store.spec.ts`

**Checkpoint**: `npx nx test strategies` passes.

---

## Phase 8: E2E Tests (30min)

Create `apps/invenet-e2e/src/strategies.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Strategy Management', () => {
  test('should create a strategy', async ({ page }) => {
    await page.goto('/strategies');
    await page.click('text=New Strategy');
    await page.fill('[name="name"]', 'Test Strategy');
    await page.fill('[name="description"]', 'Test description');
    await page.click('text=Save');

    await expect(page.locator('text=Test Strategy')).toBeVisible();
  });

  test('should assign strategy to trade', async ({ page }) => {
    await page.goto('/trades/new');
    await page.fill('[name="symbol"]', 'AAPL');
    await page.click('[placeholder="Select a trading strategy"]');
    await page.click('text=Test Strategy');
    await page.click('text=Save');

    await expect(page.locator('text=Test Strategy')).toBeVisible();
  });
});
```

**Checkpoint**: `npx nx e2e invenet-e2e` passes.

---

## Verification Checklist

Before marking the feature complete, verify:

- [ ] Backend tests passing (`dotnet test`)
- [ ] Frontend tests passing (`npx nx test strategies`)
- [ ] E2E tests passing (`npx nx e2e invenet-e2e`)
- [ ] Can create strategy via UI
- [ ] Can edit strategy via UI
- [ ] Can delete strategy via UI (soft delete)
- [ ] Can assign strategy to new trade
- [ ] Can change strategy on existing trade
- [ ] Can remove strategy from trade (set to null)
- [ ] Can filter trades by strategy
- [ ] Duplicate strategy names are rejected
- [ ] Deleted strategies don't appear in selectors
- [ ] Historical trades still show deleted strategy names
- [ ] No console errors
- [ ] Swagger docs updated
- [ ] Migration scripts committed

---

## Roll out Plan

1. Merge feature branch to main
2. Run migrations in staging environment
3. Test manually in staging
4. Deploy to production
5. Run migrations in production
6. Monitor for errors

## Rollback Plan

If issues are found:

```bash
# Backend: Rollback migration
dotnet ef database update <PreviousMigrationName>

# Frontend: Revert PR
git revert <commit-sha>
```

---

## Common Issues & Solutions

| Issue                              | Solution                                     |
| ---------------------------------- | -------------------------------------------- |
| Migration fails                    | Check PostgreSQL version, schema permissions |
| Duplicate name error               | Verify unique index created correctly        |
| Strategy not appearing in dropdown | Check isDeleted filter in query              |
| Orphaned strategy references       | Verify soft delete implementation            |
| Strategy selector empty            | Check authentication, API CORS settings      |

---

## Next Steps (Future Enhancements)

After MVP is stable, consider:

- Strategy performance analytics (win rate, P&L by strategy)
- Strategy templates/presets
- Bulk strategy assignment to trades
- Strategy tags/categories
- Export/import strategies
- Strategy usage statistics

## References

- [Feature Spec](./spec.md)
- [Implementation Plan](./plan.md)
- [Data Model](./data-model.md)
- [API Contract](./contracts/strategies-api.yaml)
- [Research](./research.md)
- [AGENTS.md](../../../AGENTS.md) - Tech stack reference
- [MODULE_TEMPLATE.md](../../../apps/api/MODULE_TEMPLATE.md) - Backend module pattern
