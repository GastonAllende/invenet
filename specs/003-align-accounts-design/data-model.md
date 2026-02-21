# Data Model: Accounts UI Refactoring - Modal Pattern Alignment + Delete

**Date**: 2026-02-20  
**Feature**: [spec.md](spec.md) | [plan.md](plan.md) | [research.md](research.md)

## Overview

This feature is primarily a UI refactoring with one new backend operation (delete). The core data model remains unchanged. This document describes the entities, UI state models, and any modifications.

## Entities

### Account (Backend - No Changes)

**Location**: `apps/api/Invenet.Api/Modules/Accounts/Domain/Account.cs`

The Account entity represents a brokerage/trading account. **No modifications required** for this feature.

```csharp
public class Account
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }  // Owner of the account
    public string Name { get; set; }
    public string Broker { get; set; }
    public string AccountType { get; set; }  // Cash, Margin, Prop, Demo
    public string BaseCurrency { get; set; }
    public decimal StartingBalance { get; set; }
    public bool IsActive { get; set; }  // Archive status (false = archived)
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation property
    public AccountRiskSettings? RiskSettings { get; set; }
}
```

**Key Properties**:

- `Id`: Unique identifier (Guid)
- `UserId`: Foreign key to user (authorization)
- `Name`: Display name for the account
- `Broker`: Brokerage firm name
- `AccountType`: One of: Cash, Margin, Prop, Demo
- `BaseCurrency`: 3-character ISO currency code (e.g., "USD", "EUR")
- `StartingBalance`: Initial capital in the account
- `IsActive`: Archive flag (true = active, false = archived/soft-deleted)
- `RiskSettings`: Optional related entity for risk management configuration

**Validation Rules**:

- Name: Required, max 200 characters
- Broker: Required, max 100 characters
- AccountType: Must be one of the valid types
- BaseCurrency: Required, exactly 3 characters
- StartingBalance: Must be >= 0

---

### AccountRiskSettings (Backend - No Changes)

**Location**: `apps/api/Invenet.Api/Modules/Accounts/Domain/AccountRiskSettings.cs`

Optional risk management settings for an account. **No modifications required**.

```csharp
public class AccountRiskSettings
{
    public Guid Id { get; set; }
    public Guid AccountId { get; set; }  // Foreign key to Account
    public decimal MaxRiskPerTradePct { get; set; }
    public decimal? MaxDailyLossPct { get; set; }
    public decimal? MaxDrawdownPct { get; set; }
    public int? MaxOpenTrades { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation property
    public Account Account { get; set; } = null!;
}
```

**Cascade Behavior**: When an Account is deleted, associated RiskSettings should be deleted (cascade delete). This is typically configured in Entity Framework configuration.

---

## DTOs (Data Transfer Objects)

### Existing DTOs (No Changes)

The following DTOs are already defined and work correctly:

1. **CreateAccountRequest**: For creating new accounts
2. **CreateAccountResponse**: Response after account creation
3. **UpdateAccountRequest**: For updating existing accounts
4. **UpdateAccountResponse**: Response after account update
5. **GetAccountResponse**: For retrieving single account details
6. **ListAccountsResponse**: For retrieving list of accounts

**Location**: `apps/api/Invenet.Api/Modules/Accounts/Features/*/`

---

### New DTO: DeleteAccountResponse

**Location**: `apps/api/Invenet.Api/Modules/Accounts/Features/DeleteAccount/DeleteAccountResponse.cs`

**Purpose**: Response for delete operation (following RESTful conventions, usually 204 No Content with no body, but include for consistency).

```csharp
namespace Invenet.Api.Modules.Accounts.Features.DeleteAccount;

/// <summary>
/// Response for account deletion operation.
/// Note: In practice, DELETE returns 204 No Content with no body.
/// This type exists for consistency and potential future use (e.g., soft delete confirmation).
/// </summary>
public sealed record DeleteAccountResponse
{
    /// <summary>
    /// ID of the deleted account (for confirmation/logging).
    /// </summary>
    public Guid Id { get; init; }

    /// <summary>
    /// Timestamp of deletion.
    /// </summary>
    public DateTime DeletedAt { get; init; }
}
```

**Note**: The actual HTTP response will be `204 No Content` with no body. This DTO is defined for type safety in the handler but won't be serialized in the response.

---

## Frontend Models

### Account Model (Frontend - No Changes)

**Location**: `libs/accounts/src/data-access/src/lib/models/account.model.ts`

TypeScript interfaces matching backend DTOs. **No modifications required** - existing interfaces work for the modal pattern.

```typescript
export interface GetAccountResponse {
  id: string;
  userId: string;
  name: string;
  broker: string;
  accountType: 'Cash' | 'Margin' | 'Prop' | 'Demo';
  baseCurrency: string;
  startingBalance: number;
  isActive: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  riskSettings?: AccountRiskSettings;
}

export interface AccountRiskSettings {
  id: string;
  accountId: string;
  riskPerTradePct: number;
  maxDailyLossPct?: number;
  maxDrawdownPct?: number;
  maxOpenTrades?: number;
}

export interface CreateAccountRequest {
  name: string;
  broker: string;
  accountType: string;
  baseCurrency: string;
  startingBalance: number;
  riskSettings?: {
    riskPerTradePct: number;
    maxDailyLossPct?: number;
    maxDrawdownPct?: number;
    maxOpenTrades?: number;
  };
}

export interface UpdateAccountRequest {
  name: string;
  broker: string;
  accountType: string;
  baseCurrency: string;
  startingBalance: number;
  isActive: boolean;
  riskSettings?: {
    riskPerTradePct: number;
    maxDailyLossPct?: number;
    maxDrawdownPct?: number;
    maxOpenTrades?: number;
  };
}
```

---

## UI State Models (New)

### Modal State

**Location**: Component-level signals in `accounts-shell.component.ts`

These are not persisted models but local UI state for controlling modal visibility and form mode.

```typescript
// Signal tracking whether the create/edit modal is visible
showFormDialog = signal<boolean>(false);

// Signal tracking which account is being edited (null for create mode)
selectedAccount = signal<GetAccountResponse | null>(null);

// Computed: determines modal title
modalTitle = computed(() => (this.selectedAccount() ? 'Edit Account' : 'Create Account'));

// Computed: determines form mode
formMode = computed<'create' | 'edit'>(() => (this.selectedAccount() ? 'edit' : 'create'));
```

**State Transitions**:

1. **User clicks "New Account"**:
   - `selectedAccount.set(null)`
   - `showFormDialog.set(true)`
   - Modal opens in create mode

2. **User clicks "Edit" on an account**:
   - `selectedAccount.set(account)`
   - `showFormDialog.set(true)`
   - Modal opens in edit mode with pre-populated form

3. **User submits form (create or edit)**:
   - API call via store method
   - On success: `showFormDialog.set(false)`, `selectedAccount.set(null)`
   - Modal closes, list refreshes

4. **User cancels form**:
   - `showFormDialog.set(false)`
   - `selectedAccount.set(null)`
   - Modal closes, no changes

5. **User clicks delete**:
   - Confirmation dialog appears (not modal, separate PrimeNG component)
   - On confirm: API delete call
   - On success: List refreshes (no modal involved)

---

### Form Mode

**Location**: `account-form.component.ts` (existing input)

The form component already accepts a `mode` input to distinguish create vs. edit:

```typescript
@Input() mode: 'create' | 'edit' = 'create';
```

This input drives:

- Form title/labels
- Validation behavior
- Submit button text ("Create Account" vs "Save Changes")

**No changes required** - this pattern works in modal context.

---

## Data Relationships

### Account ↔ RiskSettings (One-to-One, Optional)

- An Account MAY have RiskSettings
- RiskSettings MUST belong to exactly one Account
- Delete cascade: Deleting Account deletes RiskSettings

```
Account (1) ─────< RiskSettings (0..1)
```

### Account ↔ User (Many-to-One)

- An Account MUST belong to exactly one User
- A User MAY have many Accounts

```
User (1) ─────< Account (0..*)
```

**Authorization**: All account operations (GET, POST, PUT, DELETE) filter by `UserId` to ensure users can only access their own accounts.

---

## State Management (NgRx SignalStore)

**Location**: `libs/accounts/src/data-access/src/lib/store/accounts.store.ts`

The accounts store will be extended with a `deleteAccount` method.

### Existing Store State

```typescript
type AccountsState = {
  entities: GetAccountResponse[];
  isLoading: boolean;
  error: string | null;
};
```

**No changes to state shape** - deletion simply removes an entity from the `entities` array.

### New Store Method: deleteAccount

```typescript
deleteAccount: rxMethod<string>(
  pipe(
    tap(() => patchState(store, { isLoading: true })),
    switchMap((id) =>
      inject(AccountsApiService)
        .deleteAccount(id)
        .pipe(
          tapResponse({
            next: () => {
              patchState(store, (state) => ({
                entities: state.entities.filter((account) => account.id !== id),
                isLoading: false,
                error: null,
              }));
              inject(MessageService).add({
                severity: 'success',
                summary: 'Success',
                detail: 'Account deleted successfully',
              });
            },
            error: (error: HttpErrorResponse) => {
              patchState(store, {
                isLoading: false,
                error: error.error?.message || 'Failed to delete account',
              });
              inject(MessageService).add({
                severity: 'error',
                summary: 'Error',
                detail: error.error?.message || 'Failed to delete account',
              });
            },
          }),
        ),
    ),
  ),
);
```

**Behavior**:

1. Set `isLoading = true`
2. Call API delete endpoint
3. On success:
   - Remove account from `entities` array
   - Clear loading/error state
   - Show success toast
4. On error:
   - Keep account in `entities` (no removal)
   - Set error state
   - Show error toast

---

## Validation State

### Backend Validation

Account entity validation is handled in the controller:

- Required fields checked
- String length limits enforced
- Account type enum validation
- Currency code format validation

**Error responses**: `400 Bad Request` with validation message

### Frontend Validation

Form validation handled by `AccountFormComponent`:

- Required field validators
- Pattern validators (currency code: `^[A-Z]{3}$`)
- Min/max validators (balance >= 0)
- Custom validators for risk settings

**Error display**: PrimeNG form controls show validation errors inline

**No changes to validation** - works identically in modal context.

---

## Migration Considerations

### Database Migrations

**No database schema changes required.**

- Account entity unchanged
- AccountRiskSettings entity unchanged
- Existing indexes and constraints remain

### Data Migration

**No data migration required.**

- This is a UI refactoring, not a data model change
- Existing account records work as-is
- Delete operation is new but uses existing entity

---

## Summary

### Changes

- ✅ **New**: DeleteAccountResponse DTO (backend)
- ✅ **New**: deleteAccount store method (frontend)
- ✅ **New**: Modal state signals in shell component (frontend)
- ❌ **No changes**: Account entity
- ❌ **No changes**: AccountRiskSettings entity
- ❌ **No changes**: Existing DTOs (Create, Update, Get, List)
- ❌ **No changes**: Frontend models
- ❌ **No changes**: Form validation
- ❌ **No changes**: Database schema

### Conclusion

Data model impact is minimal - this is primarily a UI pattern change. The only new data concern is the delete operation, which uses the existing Account entity and adds a standard DELETE endpoint.
