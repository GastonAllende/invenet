# Research: Accounts UI Refactoring - Modal Pattern Alignment + Delete

**Date**: 2026-02-20  
**Feature**: [spec.md](spec.md) | [plan.md](plan.md)

## Purpose

This research documents the technical decisions, patterns, and best practices for refactoring the accounts page UI to align with the strategies page design, including modal-based forms and delete functionality.

## Key Decisions

### 1. Modal Dialog Implementation

**Decision**: Use PrimeNG `p-dialog` component for create/edit modals, matching the strategies page pattern.

**Rationale**:

- PrimeNG Dialog is already used successfully in `libs/strategies` for the same purpose
- Provides consistent UX across account and strategy management pages
- Built-in features: overlay, close handlers, responsive behavior, accessibility
- Zero additional dependencies - already in package.json (primeng@21.1.1)
- Well-documented Angular integration with standalone components

**Alternatives Considered**:

- **Custom modal component**: Rejected - unnecessary complexity, reinventing the wheel
- **Angular Material Dialog**: Rejected - would introduce new dependency, breaks UI consistency (PrimeNG is standard)
- **Native HTML `<dialog>` element**: Rejected - requires custom styling, less feature-complete than PrimeNG

**Implementation Pattern** (from strategies):

```typescript
// In shell component template
<p-dialog
  [header]="selectedAccount() ? 'Edit Account' : 'Create Account'"
  [(visible)]="showFormDialog"
  [modal]="true"
  [closable]="true"
  [draggable]="false"
  [resizable]="false"
  [style]="{ width: '500px' }"
>
  <lib-invenet-account-form ... />
</p-dialog>
```

---

### 2. Delete Confirmation Pattern

**Decision**: Use PrimeNG `p-confirmDialog` with `ConfirmationService` for delete confirmations.

**Rationale**:

- Exact pattern used in strategies page (`StrategyShellComponent`)
- Prevents accidental deletions with explicit user confirmation
- Handles accept/reject callbacks cleanly
- Consistent confirmation UI across the application
- Built-in message customization and severity levels

**Alternatives Considered**:

- **Browser `confirm()` dialog**: Rejected - poor UX, not customizable, blocks UI thread
- **Custom confirmation modal**: Rejected - unnecessary duplication when PrimeNG provides this
- **Inline confirmation (undo pattern)**: Rejected - doesn't match strategies pattern, more complex state management

**Implementation Pattern** (from strategies):

```typescript
// In shell component
import { ConfirmationService } from 'primeng/api';

onDeleteAccount(id: string) {
  this.confirmationService.confirm({
    message: 'Are you sure you want to delete this account?',
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      // Call delete API
      this.accountsStore.deleteAccount(id);
    }
  });
}
```

---

### 3. State Management for Modal Visibility

**Decision**: Use Angular signals in shell component to track modal state (following strategies pattern).

**Rationale**:

- Strategies page uses `signal<boolean>` for `showFormDialog` - same approach works here
- Signals provide reactive state updates with minimal boilerplate
- Already using NgRx SignalStore for data layer, signals for UI state aligns well
- Simplifies template bindings: `[(visible)]="showFormDialog"`

**Alternatives Considered**:

- **Add modal state to NgRx SignalStore**: Rejected - UI state doesn't belong in data store, creates unnecessary coupling
- **RxJS BehaviorSubject**: Rejected - signals are simpler, more modern, better Angular integration
- **Two-way binding with template variable**: Rejected - harder to control programmatically

**Implementation**:

```typescript
// Shell component
showFormDialog = signal(false);
selectedAccount = signal<GetAccountResponse | null>(null);

onCreateAccount() {
  this.selectedAccount.set(null);
  this.showFormDialog.set(true);
}

onEditAccount(account: GetAccountResponse) {
  this.selectedAccount.set(account);
  this.showFormDialog.set(true);
}

onCancelForm() {
  this.showFormDialog.set(false);
  this.selectedAccount.set(null);
}
```

---

### 4. Component Communication Pattern

**Decision**: Account list component emits create event, shell component handles it (inverse of current pattern).

**Rationale**:

- Currently, the "Create Account" button is in shell component, passing createMode to list
- Strategies pattern: "New Strategy" button is IN the list component, emits `(create)` event
- Moving button to list component achieves visual alignment requirement (FR-004, FR-005)
- Shell component remains orchestrator, list component becomes more self-contained
- Follows smart/dumb component pattern: list is presentational, shell is smart

**Current Pattern** (accounts - to be changed):

```html
<!-- accounts-shell.component.html -->
<div class="header">
  <h1>Accounts</h1>
  <p-button (onClick)="showCreateForm()"></p-button>
</div>
<lib-account-list ... />
```

**Target Pattern** (strategies - to implement):

```html
<!-- account-list.component.html -->
<div class="list-header">
  <h2>Accounts</h2>
  <p-button (onClick)="onCreate()"></p-button>
</div>

<!-- account-list.component.ts -->
@Output() create = new EventEmitter<void
  >();

  <!-- accounts-shell.component.html -->
  <lib-account-list (create)="onCreateAccount()" ...
/></void>
```

---

### 5. Backend Delete Endpoint Design

**Decision**: Add hard delete via `DELETE /api/accounts/{id}` endpoint following RESTful conventions.

**Rationale**:

- Spec assumptions state: "Account deletion will be permanent (hard delete) unless backend implements soft delete"
- Strategies page uses hard delete (`.isDeleted` flag but permanent removal from view)
- Simpler implementation: no soft-delete complexity, no recovery/trash functionality (out of scope)
- RESTful convention: DELETE verb for resource removal
- Consistent with existing endpoints: GET, POST, PUT already defined in `AccountsController`

**Alternatives Considered**:

- **Soft delete (IsDeleted flag)**: Rejected - spec explicitly excludes "undo functionality" and "trash/recycle bin" (Out of Scope)
- **Custom action endpoint (POST /api/accounts/{id}/delete)**: Rejected - violates REST conventions when DELETE verb is appropriate
- **Archive instead of delete**: Rejected - archive already exists (IsActive=false), delete should be distinct permanent removal

**Implementation Approach**:

```csharp
// New feature folder: Features/DeleteAccount/
[HttpDelete("{id:guid}")]
public async Task<IActionResult> Delete(Guid id)
{
    var userId = GetCurrentUserId();
    var account = await _context.Accounts
        .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

    if (account == null) return NotFound();

    _context.Accounts.Remove(account);
    await _context.SaveChangesAsync();

    return NoContent(); // 204 No Content
}
```

**Note**: Business rule validation (e.g., preventing delete if account has trades) should be implemented if required, but spec doesn't mandate this - marked as edge case.

---

### 6. Form Component Reusability

**Decision**: Reuse existing `AccountFormComponent` without modification inside modal.

**Rationale**:

- Spec assumption: "The existing account-form component is already fully functional and only needs to be relocated into a modal container"
- Form already handles create vs edit modes via `[mode]` input
- Form already emits `(formSubmit)` and `(formCancel)` events
- No validation changes needed - works identically in modal context
- Reduces risk: no changes to tested form logic

**Validation**:

- Tested by strategies implementation: `StrategyFormComponent` works unchanged in `p-dialog`
- PrimeNG dialog supports any content, doesn't interfere with form controls

**No changes needed to account-form component**.

---

### 7. Error Handling for Delete Operation

**Decision**: Follow strategies pattern - show toast on error, keep confirmation dialog closed.

**Rationale**:

- Strategies page shows error toast on delete failure
- User-friendly: errors are visible via toast notification (PrimeNG MessageService)
- Confirmation dialog closes regardless of success/failure (user has made their decision)
- Failed deletes don't remove item from list (store update only happens on success)

**Implementation**:

```typescript
// In store (accounts.store.ts)
deleteAccount: rxMethod<string>(
  pipe(
    switchMap((id) =>
      this.accountsApiService.deleteAccount(id).pipe(
        tapResponse({
          next: () => {
            patchState(this.store, (state) => ({
              entities: state.entities.filter((a) => a.id !== id),
            }));
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Account deleted successfully',
            });
          },
          error: (error: HttpErrorResponse) => {
            this.messageService.add({
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

---

## Technology Stack Validation

### Frontend Dependencies (Already Available)

| Dependency    | Version | Usage                                                         | Status    |
| ------------- | ------- | ------------------------------------------------------------- | --------- |
| Angular       | 21.1.0  | Core framework                                                | ✅ In use |
| PrimeNG       | 21.1.1  | UI components (Dialog, ConfirmDialog, Toast, Button, Table)   | ✅ In use |
| @ngrx/signals | 21.0.1  | State management (SignalStore)                                | ✅ In use |
| PrimeIcons    | 7.0.0   | Icons (pi-plus, pi-pencil, pi-trash, pi-exclamation-triangle) | ✅ In use |

**No new frontend dependencies required.**

### Backend Dependencies (Already Available)

| Dependency            | Version       | Usage              | Status    |
| --------------------- | ------------- | ------------------ | --------- |
| ASP.NET Core          | .NET 10       | Web framework      | ✅ In use |
| Entity Framework Core | .NET 10       | ORM for PostgreSQL | ✅ In use |
| PostgreSQL            | (via EF Core) | Database           | ✅ In use |

**No new backend dependencies required.**

---

## Best Practices & Patterns Reference

### Angular 21 Patterns (from ANGULAR_BEST_PRACTICES.md)

1. **Standalone Components**: All components are standalone (no NgModules)
   - ✅ Accounts components already follow this
   - ✅ Add Dialog/ConfirmDialog imports to shell component imports array

2. **Signals for Reactivity**: Use signals for local state
   - ✅ Use `signal()` for `showFormDialog` and `selectedAccount`
   - ✅ NgRx SignalStore already used for accounts data

3. **Control Flow Syntax**: Use `@if`, `@for` instead of `*ngIf`, `*ngFor`
   - ✅ Existing code already uses new control flow

4. **Input/Output**: Use `@Input()` and `@Output()` decorators
   - ✅ Add `@Output() create = new EventEmitter<void>()` to account-list

5. **Dependency Injection**: Use `inject()` function
   - ✅ All components already use `inject()`

### NgRx SignalStore Patterns (from NGRX_SIGNALSTORE_GUIDE.md)

1. **Store Methods**: Use `rxMethod` for async operations
   - ✅ Add `deleteAccount` method using `rxMethod` pattern
   - ✅ Follow existing patterns from `createAccount`, `updateAccount`

2. **Optimistic Updates**: Update state on success only (not optimistic for delete)
   - ✅ Wait for API success before removing from `entities`

3. **Error Handling**: Use `tapResponse` for consistent error handling
   - ✅ Show success/error toasts via MessageService

### PrimeNG Component Usage (from strategies reference)

1. **DialogModule**: Import in shell component
   - Properties: `header`, `visible`, `modal`, `closable`, `draggable`, `resizable`, `style`

2. **ConfirmDialogModule**: Import in shell component
   - Requires `ConfirmationService` in providers array
   - Use `confirmationService.confirm()` for delete confirmation

3. **ToastModule**: Already in use for notifications
   - Keep existing MessageService integration

4. **ButtonModule**: Already in use
   - Add delete button with `icon="pi pi-trash"`, `severity="danger"`

---

## Migration Strategy

Since this is a UI refactoring of existing functionality:

1. **No database migrations needed** - using existing Account entity
2. **Backward compatible API** - new DELETE endpoint is additive
3. **Frontend changes are isolated** to accounts library components
4. **No breaking changes** - feature parity maintained

---

## Security Considerations

### Authorization

- **DELETE endpoint must verify userId**: Only account owner can delete
- Pattern: `var account = await _context.Accounts.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId)`
- Follows existing authorization pattern from GET/PUT endpoints

### CORS

- No changes needed - delete endpoint uses same /api/accounts route

### Input Validation

- ID validation: Guid format enforced by route constraint `{id:guid}`
- 404 if account not found or not owned by user
- No request body validation needed (DELETE with ID only)

---

## Testing Strategy

### Frontend Unit Tests (Vitest)

- **accounts-shell.component.spec.ts**:
  - Test modal opening/closing for create/edit
  - Test delete confirmation dialog triggering
  - Test form submission handling

- **account-list.component.spec.ts**:
  - Test create event emission
  - Test delete event emission
  - Test button rendering

- **accounts.store.spec.ts**:
  - Test deleteAccount method
  - Test entity removal on success
  - Test error handling

### Backend Unit Tests (XUnit)

- **DeleteAccountTests.cs**:
  - Test successful deletion (204 No Content)
  - Test not found (404)
  - Test unauthorized deletion attempt (404 - same as not found, don't leak existence)
  - Test userId authorization

### E2E Tests (Playwright)

- **accounts.e2e.spec.ts**:
  - Full create account via modal flow
  - Full edit account via modal flow
  - Full delete account with confirmation flow
  - Cancel operations (create, edit, delete)
  - Verify list updates after operations

---

## Performance Considerations

### Frontend

- **Modal rendering**: PrimeNG Dialog uses lazy content projection - form only rendered when modal opens
- **List updates**: NgRx SignalStore efficiently updates entity array on delete (filter operation)
- **No unnecessary re-renders**: Signals prevent over-rendering

### Backend

- **Delete operation**: Single query + single delete - O(1) database operation
- **Authorization check**: Combined with fetch query - no extra round trip
- **Transaction handling**: EF Core SaveChangesAsync wraps in transaction

**Expected performance**: Well within SC-005 requirement (<2 seconds for form submission/deletion)

---

## Summary

All technical research is complete. Key findings:

1. **Zero new dependencies** - everything needed is already in the project
2. **Proven patterns** - strategies page provides working reference implementation
3. **Low risk** - UI refactoring with minimal backend changes
4. **Clear path** - documented patterns from strategies can be directly applied to accounts

Ready to proceed to Phase 1: Design (data-model.md, contracts/, quickstart.md).
