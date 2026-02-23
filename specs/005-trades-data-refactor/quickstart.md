# Developer Quickstart: Trades Data Refactor

**Branch**: `005-trades-data-refactor`  
**Date**: 2026-02-22

---

## Prerequisites

```bash
# Ensure you are on the feature branch
git checkout 005-trades-data-refactor

# Backend: restore dependencies
cd apps/Invenet.Api
dotnet restore

# Frontend: install packages (if not already)
cd ../../..
npm install
```

## Implementation Order

Follow this order to avoid breaking the build at any step:

```
1. Backend: Domain entity  →
2. Backend: EF config      →
3. Backend: Migration      →
4. Backend: Response DTO   →
5. Backend: Controller     →
6. Frontend: Model         →
7. Frontend: API service   →
8. Frontend: Store         →
9. Frontend: Component     →
10. Frontend: HTML template
```

---

## Step 1 — Backend: Extend the Trade Domain Entity

**File**: `apps/api/Invenet.Api/Modules/Trades/Domain/Trade.cs`

Add the 2 enums and 7 new properties to the existing class:

```csharp
public enum TradeType { BUY, SELL }
public enum TradeStatus { Win, Loss, Open }

public class Trade
{
    // ... existing fields (Id, AccountId, StrategyId, Symbol, EntryPrice, ExitPrice, CreatedAt, UpdatedAt, Strategy) ...

    // NEW
    public TradeType Type { get; set; }
    public DateTime Date { get; set; }
    public decimal PositionSize { get; set; }
    public decimal InvestedAmount { get; set; }
    public decimal Commission { get; set; }
    public decimal ProfitLoss { get; set; }
    public TradeStatus Status { get; set; }
}
```

## Step 2 — Backend: Update EF Core Configuration

**File**: `apps/api/Invenet.Api/Modules/Trades/Infrastructure/Data/TradeConfiguration.cs`

Add inside `Configure()`:

```csharp
builder.Property(t => t.Type)
    .IsRequired()
    .HasMaxLength(4)
    .HasConversion<string>();

builder.Property(t => t.Date)
    .IsRequired();

builder.Property(t => t.PositionSize)
    .IsRequired()
    .HasColumnType("decimal(18,4)");

builder.Property(t => t.InvestedAmount)
    .IsRequired()
    .HasColumnType("decimal(18,2)");

builder.Property(t => t.Commission)
    .IsRequired()
    .HasColumnType("decimal(18,2)")
    .HasDefaultValue(0m);

builder.Property(t => t.ProfitLoss)
    .IsRequired()
    .HasColumnType("decimal(18,2)")
    .HasDefaultValue(0m);

builder.Property(t => t.Status)
    .IsRequired()
    .HasMaxLength(10)
    .HasConversion<string>();

// New indexes
builder.HasIndex(t => t.Date)
    .HasDatabaseName("ix_trades_date");
builder.HasIndex(t => new { t.AccountId, t.Date })
    .HasDatabaseName("ix_trades_account_date");
```

## Step 3 — Backend: Add EF Core Migration

```bash
cd apps/Invenet.Api
dotnet ef migrations add AddTradeFields
```

Review the generated migration file in `Migrations/` — confirm the 7 new columns appear with their defaults. Then apply:

```bash
dotnet ef database update
```

Verify:

```sql
-- In psql or your DB client:
\d trades.trades
-- All 7 new columns should be present
```

## Step 4 — Backend: Response DTO

**New file**: `apps/api/Invenet.Api/Modules/Trades/Features/ListTrades/ListTradesResponse.cs`

```csharp
namespace Invenet.Api.Modules.Trades.Features.ListTrades;

public record ListTradesResponse(
    List<TradeListItem> Trades,
    int Total
);

public record TradeListItem(
    Guid Id,
    Guid AccountId,
    Guid? StrategyId,
    string Type,
    DateTime Date,
    string Symbol,
    decimal EntryPrice,
    decimal? ExitPrice,
    decimal PositionSize,
    decimal InvestedAmount,
    decimal Commission,
    decimal ProfitLoss,
    string Status,
    DateTime CreatedAt
);
```

## Step 5 — Backend: Implement the Controller Endpoint

**File**: `apps/api/Invenet.Api/Modules/Trades/API/TradesController.cs`

Replace the stub `GetTrades` action:

```csharp
using System.Security.Claims;
using Invenet.Api.Modules.Shared.Infrastructure.Data;
using Invenet.Api.Modules.Trades.Features.ListTrades;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Invenet.Api.Modules.Trades.API;

[ApiController]
[Route("api/trades")]
[Authorize]
public sealed class TradesController : ControllerBase
{
    private readonly ModularDbContext _context;
    private readonly ILogger<TradesController> _logger;

    public TradesController(ModularDbContext context, ILogger<TradesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    private Guid GetCurrentUserId()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
            throw new UnauthorizedAccessException("User ID not found in claims");
        return userId;
    }

    [HttpGet]
    public async Task<ActionResult<ListTradesResponse>> GetTrades()
    {
        var userId = GetCurrentUserId();

        var userAccountIds = await _context.Accounts
            .Where(a => a.UserId == userId)
            .Select(a => a.Id)
            .ToListAsync();

        var trades = await _context.Trades
            .Where(t => userAccountIds.Contains(t.AccountId))
            .OrderByDescending(t => t.Date)
            .Select(t => new TradeListItem(
                t.Id, t.AccountId, t.StrategyId,
                t.Type.ToString(), t.Date, t.Symbol,
                t.EntryPrice, t.ExitPrice,
                t.PositionSize, t.InvestedAmount,
                t.Commission, t.ProfitLoss,
                t.Status.ToString(), t.CreatedAt
            ))
            .ToListAsync();

        return Ok(new ListTradesResponse(trades, trades.Count));
    }
}
```

**Verify backend**:

```bash
cd apps/Invenet.Api
dotnet build
# Should compile with no errors
dotnet watch run
# Test: curl -H "Authorization: Bearer <token>" http://localhost:5000/api/trades
```

---

## Step 6 — Frontend: Trade Model

**New file**: `libs/trades/src/data-access/src/lib/models/trade.model.ts`

```typescript
export interface Trade {
  id: string;
  accountId: string;
  strategyId?: string | null;
  type: 'BUY' | 'SELL';
  date: string;
  symbol: string;
  entryPrice: number;
  exitPrice?: number | null;
  positionSize: number;
  investedAmount: number;
  commission: number;
  profitLoss: number;
  status: 'Win' | 'Loss' | 'Open';
  createdAt: string;
}

export interface ListTradesResponse {
  trades: Trade[];
  total: number;
}
```

## Step 7 — Frontend: API Service

**New file**: `libs/trades/src/data-access/src/lib/services/trades-api.service.ts`

```typescript
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_BASE_URL } from '@invenet/core';
import type { ListTradesResponse } from '../models/trade.model';

@Injectable({ providedIn: 'root' })
export class TradesApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly baseUrl = `${this.apiBaseUrl}/api/trades`;

  list(): Observable<ListTradesResponse> {
    return this.http.get<ListTradesResponse>(this.baseUrl).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Failed to load trades';
        if (error.status === 401) errorMessage = 'Authentication required';
        else if (error.error?.message) errorMessage = error.error.message;
        return throwError(() => new Error(errorMessage));
      }),
    );
  }
}
```

## Step 8 — Frontend: NgRx SignalStore

**New file**: `libs/trades/src/data-access/src/lib/store/trades.store.ts`

```typescript
import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';
import type { Trade, ListTradesResponse } from '../models/trade.model';
import { TradesApiService } from '../services/trades-api.service';

type TradesState = { isLoading: boolean; error: string | null };
const initialState: TradesState = { isLoading: false, error: null };

export const TradesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities<Trade>(),
  withMethods((store, apiService = inject(TradesApiService)) => ({
    loadTrades: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          apiService.list().pipe(
            tap((response: ListTradesResponse) => {
              patchState(store, setAllEntities(response.trades), {
                isLoading: false,
                error: null,
              });
            }),
            catchError((error: Error) => {
              patchState(store, {
                isLoading: false,
                error: error.message || 'Failed to load trades',
              });
              return of(null);
            }),
          ),
        ),
      ),
    ),
    clearError(): void {
      patchState(store, { error: null });
    },
  })),
);
```

## Step 9 — Frontend: Update the Trades Component

**File**: `libs/trades/src/lib/trades/trades.ts`

Replace the entire component with:

```typescript
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { TradesStore } from '../store/trades.store';

@Component({
  selector: 'lib-trades',
  imports: [CommonModule, TableModule, ButtonModule, TagModule, CardModule, MessageModule],
  templateUrl: './trades.html',
  styleUrl: './trades.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Trades implements OnInit {
  protected readonly store = inject(TradesStore);

  readonly trades = this.store.entities;
  readonly loading = this.store.isLoading;
  readonly error = this.store.error;

  ngOnInit(): void {
    this.store.loadTrades();
  }

  getTypeSeverity(type: string): 'success' | 'danger' {
    return type === 'BUY' ? 'success' : 'danger';
  }

  getStatusSeverity(status: string): 'success' | 'danger' | 'info' {
    switch (status) {
      case 'Win':
        return 'success';
      case 'Loss':
        return 'danger';
      default:
        return 'info'; // Open
    }
  }
}
```

## Step 10 — Frontend: Update the HTML Template

**File**: `libs/trades/src/lib/trades/trades.html`

```html
<div class="trades-container">
  <p-card>
    <ng-template pTemplate="header">
      <div class="flex justify-between items-center p-4">
        <h2 class="text-2xl font-semibold m-0">Trade History</h2>
      </div>
    </ng-template>

    @if (error()) {
    <p-message severity="error" [text]="error()!" styleClass="mb-4" />
    }

    <p-table [value]="trades()" [loading]="loading()" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[5, 10, 20, 50]" [showCurrentPageReport]="true" currentPageReportTemplate="Showing {first} to {last} of {totalRecords} trades" [tableStyle]="{ 'min-width': '70rem' }" styleClass="p-datatable-sm">
      <ng-template pTemplate="header">
        <tr>
          <th pSortableColumn="date">Date <p-sortIcon field="date" /></th>
          <th pSortableColumn="symbol">Symbol <p-sortIcon field="symbol" /></th>
          <th pSortableColumn="type">Type <p-sortIcon field="type" /></th>
          <th pSortableColumn="entryPrice">Entry Price <p-sortIcon field="entryPrice" /></th>
          <th pSortableColumn="exitPrice">Exit Price <p-sortIcon field="exitPrice" /></th>
          <th pSortableColumn="positionSize">Position Size <p-sortIcon field="positionSize" /></th>
          <th pSortableColumn="investedAmount">Invested <p-sortIcon field="investedAmount" /></th>
          <th pSortableColumn="commission">Commission <p-sortIcon field="commission" /></th>
          <th pSortableColumn="profitLoss">P&L <p-sortIcon field="profitLoss" /></th>
          <th pSortableColumn="status">Status <p-sortIcon field="status" /></th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-trade>
        <tr>
          <td>{{ trade.date | date: 'short' }}</td>
          <td class="font-semibold">{{ trade.symbol }}</td>
          <td>
            <p-tag [value]="trade.type" [severity]="getTypeSeverity(trade.type)" />
          </td>
          <td>{{ trade.entryPrice | currency }}</td>
          <td>{{ trade.exitPrice != null ? (trade.exitPrice | currency) : '—' }}</td>
          <td>{{ trade.positionSize }}</td>
          <td class="font-semibold">{{ trade.investedAmount | currency }}</td>
          <td>{{ trade.commission | currency }}</td>
          <td [class]="trade.profitLoss >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'">{{ trade.profitLoss | currency }}</td>
          <td>
            <p-tag [value]="trade.status" [severity]="getStatusSeverity(trade.status)" />
          </td>
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="10" class="text-center py-4">No trades found.</td>
        </tr>
      </ng-template>
    </p-table>
  </p-card>
</div>
```

## Step 11 — Frontend: Update index.ts Exports

**File**: `libs/trades/src/data-access/src/index.ts` _(new)_ and `libs/trades/src/index.ts` _(update)_

```typescript
// libs/trades/src/data-access/src/index.ts  (NEW — mirrors accounts data-access barrel)
export type { Trade, ListTradesResponse } from './lib/models/trade.model';
export { TradesStore } from './lib/store/trades.store';
export { TradesApiService } from './lib/services/trades-api.service';

// libs/trades/src/index.ts  (UPDATE — keep component export, add data-access re-export)
export { Trades } from './lib/trades/trades';
export * from './data-access/src';
```

---

## Verification Checklist

### Backend

- [ ] `dotnet build` — zero errors
- [ ] Migration applied: `dotnet ef database update`
- [ ] All 7 new columns present in `trades.trades`
- [ ] `GET /api/trades` returns `200` with correct JSON shape (test with a JWT)
- [ ] `GET /api/trades` on unauthenticated request returns `401`
- [ ] `dotnet test` — all existing tests pass

### Frontend

- [ ] `npx nx build invenet` — zero errors
- [ ] `npx nx lint invenet` — clean
- [ ] `npx nx test invenet` — all tests pass
- [ ] Trade History page loads with a spinner, then shows real trades (or empty state)
- [ ] No hardcoded sample data visible anywhere on the page
- [ ] BUY tags show green, SELL tags show red
- [ ] Win tags show green, Loss tags show red, Open tags show info
- [ ] Pagination works with 10 rows per page
- [ ] Column sorting works for all columns
- [ ] P&L column is green for positive, red for negative
- [ ] Trades with `exitPrice = null` show `—` in the Exit Price column

### Manual E2E Smoke Test

1. Start backend: `cd apps/Invenet.Api && dotnet run`
2. Start frontend: `npx nx serve invenet`
3. Log in with a test account
4. Navigate to the Trades page
5. Confirm the table shows real trades (or empty state message if none exist)
6. Confirm no JavaScript console errors
