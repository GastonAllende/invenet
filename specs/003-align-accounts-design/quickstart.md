# Quickstart: Accounts UI Refactoring - Modal Pattern Alignment + Delete

**Date**: 2026-02-20  
**Feature**: [spec.md](spec.md) | [plan.md](plan.md) | [research.md](research.md)

## For Users

### What Changed?

The accounts page now has a more streamlined, modal-based workflow that matches the strategies page:

1. **Create/Edit in Modals**: Instead of replacing the entire page, account forms now open in popup dialogs
2. **Always See Your List**: Your accounts list stays visible in the background while you work with forms
3. **Delete Accounts**: You can now permanently delete accounts you no longer need (with confirmation)
4. **Consistent Design**: The page layout, buttons, and table match the strategies page you're already familiar with

### How to Use

#### Creating a New Account

1. Navigate to the Accounts page
2. Click the **"New Account"** button in the top-right of the accounts list
3. A modal dialog opens with an empty form
4. Fill in your account details:
   - Name (e.g., "TD Ameritrade Main")
   - Broker (e.g., "TD Ameritrade")
   - Account Type (Cash, Margin, Prop, or Demo)
   - Currency (3-letter code: USD, EUR, etc.)
   - Starting Balance
   - Optional: Risk settings (risk per trade %, max daily loss %, etc.)
5. Click **"Create Account"**
6. The modal closes and your new account appears in the list

**Cancel anytime**: Click the X button or "Cancel" to close the modal without saving.

---

#### Editing an Existing Account

1. Find the account you want to edit in the list
2. Click the **pencil icon (✏️)** in the Actions column
3. A modal dialog opens with the account's current details pre-filled
4. Make your changes
5. Click **"Save Changes"**
6. The modal closes and your changes are reflected in the list

**Cancel anytime**: Click the X button or "Cancel" to close the modal without saving changes.

---

#### Deleting an Account

1. Find the account you want to delete in the list
2. Click the **trash icon (🗑️)** in the Actions column
3. A confirmation dialog appears asking you to confirm deletion
4. Click **"Yes"** to permanently delete the account, or **"No"** to cancel
5. If confirmed, the account is removed from the list

**Warning**: Deletion is permanent and cannot be undone. Make sure you really want to delete the account before confirming.

---

#### Viewing Archived Accounts

Archiving (setting `IsActive = false`) is still available as a soft-delete option:

1. Use the **"Show Archived"** checkbox to include archived accounts in the list
2. Archived accounts have an "Inactive" status badge
3. You can still edit archived accounts to reactivate them

**Delete vs Archive**:

- **Archive**: Account becomes inactive but data is preserved (can be restored by editing and setting active)
- **Delete**: Account is permanently removed (cannot be restored)

---

## For Developers

### Architecture Overview

This feature refactors the accounts page UI to use modal dialogs (PrimeNG `p-dialog` and `p-confirmDialog`) and adds a DELETE API endpoint. Key changes:

**Frontend**:

- `AccountsShellComponent`: Manages modal state, handles form dialog open/close
- `AccountListComponent`: Emits create/edit/delete events, includes "New Account" button in header
- `AccountFormComponent`: Reused unchanged inside modal
- `AccountsStore`: New `deleteAccount()` method

**Backend**:

- New `DELETE /api/accounts/{id}` endpoint in `AccountsController`
- New `DeleteAccount` feature folder with handler

---

### Development Setup

#### Prerequisites

- Node.js 20+ (for frontend)
- .NET 10 SDK (for backend)
- PostgreSQL running locally or connection string configured
- Nx CLI: `npm install -g nx`

#### Running Locally

```bash
# Terminal 1: Frontend dev server
npx nx serve invenet
# Runs on http://localhost:4200

# Terminal 2: Backend dev server
cd apps/api/Invenet.Api
dotnet watch run
# Runs on https://localhost:7001
```

Navigate to http://localhost:4200/accounts to see the refactored accounts page.

---

### Key Files Modified

#### Frontend

```
libs/accounts/
├── src/
│   ├── data-access/src/lib/
│   │   ├── services/accounts-api.service.ts      # ADD: deleteAccount() method
│   │   └── store/accounts.store.ts               # ADD: deleteAccount rxMethod
│   └── lib/
│       ├── accounts/accounts-shell/
│       │   ├── accounts-shell.component.ts       # MODIFY: Add modal state signals
│       │   ├── accounts-shell.component.html     # MODIFY: Wrap form in p-dialog
│       │   └── accounts-shell.component.css      # UPDATE: Remove inline form styles
│       └── ui/
│           ├── account-form/                     # NO CHANGES (reused in modal)
│           └── account-list/
│               ├── account-list.component.ts     # MODIFY: Add @Output() create, delete
│               ├── account-list.component.html   # MODIFY: Add "New Account" button
│               └── account-list.component.css    # UPDATE: Header styles
```

#### Backend

```
apps/api/Invenet.Api/Modules/Accounts/
├── API/AccountsController.cs                     # ADD: Delete() method
└── Features/DeleteAccount/                       # NEW FOLDER
    ├── DeleteAccountHandler.cs                   # NEW: Business logic (if using MediatR)
    └── DeleteAccountResponse.cs                  # NEW: Response DTO
```

---

### Implementation Checklist

#### Backend Tasks

- [ ] Create `Features/DeleteAccount/` folder
- [ ] Add `DeleteAccountResponse.cs` DTO
- [ ] Add `Delete()` method to `AccountsController.cs`
  - [ ] Extract userId from claims
  - [ ] Query account with userId filter
  - [ ] Return 404 if not found or not authorized
  - [ ] Call `_context.Accounts.Remove(account)`
  - [ ] Call `await _context.SaveChangesAsync()`
  - [ ] Return `NoContent()` (204)
  - [ ] Add logging for audit trail
- [ ] Verify cascade delete for `AccountRiskSettings` in EF configuration
- [ ] Write unit tests for delete endpoint
- [ ] Update API documentation/Swagger comments

#### Frontend Tasks

- [ ] **accounts-api.service.ts**: Add `deleteAccount(id: string): Observable<void>`
- [ ] **accounts.store.ts**: Add `deleteAccount` rxMethod with error handling
- [ ] **accounts-shell.component.ts**:
  - [ ] Add imports: `DialogModule`, `ConfirmDialogModule`
  - [ ] Add `ConfirmationService` to providers
  - [ ] Add signals: `showFormDialog`, `selectedAccount`
  - [ ] Add methods: `onCreateAccount()`, `onEditAccount()`, `onDeleteAccount()`, `onCancelForm()`
- [ ] **accounts-shell.component.html**:
  - [ ] Remove header with create button (moved to list)
  - [ ] Wrap `<lib-invenet-account-form>` in `<p-dialog>`
  - [ ] Add `<p-confirmDialog>` component
  - [ ] Update event bindings on `<lib-account-list>`
- [ ] **account-list.component.ts**:
  - [ ] Add `@Output() create = new EventEmitter<void>()`
  - [ ] Add `@Output() delete = new EventEmitter<string>()`
  - [ ] Add `onCreate()` and `onDelete(id)` methods
- [ ] **account-list.component.html**:
  - [ ] Add "New Account" button to list header
  - [ ] Add delete button (trash icon) to actions column
- [ ] Update component tests for new behavior
- [ ] Add E2E tests for modal workflows

---

### Code Examples

#### Adding Delete to API Service

```typescript
// libs/accounts/src/data-access/src/lib/services/accounts-api.service.ts

deleteAccount(id: string): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/accounts/${id}`);
}
```

#### Adding Delete to Store

```typescript
// libs/accounts/src/data-access/src/lib/store/accounts.store.ts

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

#### Shell Component Modal State

```typescript
// libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.ts

import { ConfirmationService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'lib-invenet-accounts-shell',
  standalone: true,
  imports: [CommonModule, Toast, DialogModule, ConfirmDialogModule, AccountListComponent, AccountFormComponent],
  providers: [MessageService, ConfirmationService],
  // ...
})
export class AccountsShellComponent {
  accountsStore = inject(AccountsStore);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);

  showFormDialog = signal(false);
  selectedAccount = signal<GetAccountResponse | null>(null);
  includeArchived = signal(false);

  ngOnInit() {
    this.accountsStore.loadAccounts();
  }

  onCreateAccount() {
    this.selectedAccount.set(null);
    this.showFormDialog.set(true);
  }

  onEditAccount(account: GetAccountResponse) {
    this.selectedAccount.set(account);
    this.showFormDialog.set(true);
  }

  onDeleteAccount(id: string) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this account? This action cannot be undone.',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.accountsStore.deleteAccount(id);
      },
    });
  }

  onSaveAccount(request: CreateAccountRequest | UpdateAccountRequest) {
    if (this.selectedAccount()) {
      // Edit mode
      this.accountsStore.updateAccount({
        id: this.selectedAccount()!.id,
        ...request,
      });
    } else {
      // Create mode
      this.accountsStore.createAccount(request);
    }
    this.showFormDialog.set(false);
    this.selectedAccount.set(null);
  }

  onCancelForm() {
    this.showFormDialog.set(false);
    this.selectedAccount.set(null);
  }

  onIncludeArchivedChange(includeArchived: boolean) {
    this.includeArchived.set(includeArchived);
    this.accountsStore.loadAccounts({ includeArchived });
  }
}
```

#### Shell Component Template

```html
<!-- libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.html -->

<div class="accounts-shell">
  <p-toast></p-toast>
  <p-confirmDialog></p-confirmDialog>

  <lib-account-list [accounts]="accountsStore.entities()" [includeArchived]="includeArchived()" [isLoading]="accountsStore.isLoading()" (create)="onCreateAccount()" (edit)="onEditAccount($event)" (delete)="onDeleteAccount($event)" (includeArchivedChange)="onIncludeArchivedChange($event)"></lib-account-list>

  <p-dialog [header]="selectedAccount() ? 'Edit Account' : 'Create Account'" [(visible)]="showFormDialog" [modal]="true" [closable]="true" [draggable]="false" [resizable]="false" [style]="{ width: '500px' }">
    <lib-invenet-account-form [account]="selectedAccount()" [mode]="selectedAccount() ? 'edit' : 'create'" [isLoading]="accountsStore.isLoading()" (formSubmit)="onSaveAccount($event)" (formCancel)="onCancelForm()"></lib-invenet-account-form>
  </p-dialog>
</div>
```

#### Backend Delete Endpoint

```csharp
// apps/api/Invenet.Api/Modules/Accounts/API/AccountsController.cs

/// <summary>
/// Delete an account.
/// </summary>
/// <param name="id">Account ID to delete</param>
/// <returns>204 No Content on success</returns>
/// <response code="204">Account deleted successfully</response>
/// <response code="404">Account not found or not authorized</response>
[HttpDelete("{id:guid}")]
[ProducesResponseType(StatusCodes.Status204NoContent)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public async Task<IActionResult> Delete(Guid id)
{
    var userId = GetCurrentUserId();

    var account = await _context.Accounts
        .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

    if (account == null)
    {
        return NotFound();
    }

    _context.Accounts.Remove(account);
    await _context.SaveChangesAsync();

    _logger.LogInformation(
        "Account {AccountId} deleted by user {UserId}",
        id,
        userId
    );

    return NoContent();
}
```

---

### Testing

#### Running Frontend Tests

```bash
# Unit tests
npx nx test accounts

# E2E tests
npx nx e2e invenet-e2e
```

#### Running Backend Tests

```bash
cd apps/api/Invenet.Test
dotnet test
```

#### Manual Testing Checklist

- [ ] Create account via modal → Success toast, account appears in list
- [ ] Edit account via modal → Success toast, changes reflected in list
- [ ] Delete account with confirmation → Success toast, account removed from list
- [ ] Cancel create dialog → No account created, modal closes
- [ ] Cancel edit dialog → No changes saved, modal closes
- [ ] Cancel delete confirmation → No account deleted, list unchanged
- [ ] Verify modal remains open on validation error
- [ ] Verify modal closes on successful save/create
- [ ] Verify delete of account with risk settings cascades correctly
- [ ] Verify authorization: cannot delete another user's account

---

### Common Issues & Troubleshooting

#### Modal doesn't open

- **Check**: `showFormDialog` signal is being set to `true`
- **Check**: `DialogModule` is imported in shell component
- **Check**: `p-dialog` is in the template

#### Delete confirmation doesn't appear

- **Check**: `ConfirmDialogModule` is imported
- **Check**: `ConfirmationService` is in providers array
- **Check**: `<p-confirmDialog></p-confirmDialog>` is in template
- **Check**: `confirmationService.confirm()` is being called

#### "Create Account" button missing

- **Check**: Button is in `account-list.component.html` header
- **Check**: `(create)` event is being emitted
- **Check**: Shell component is listening to `(create)="onCreateAccount()"`

#### Delete endpoint returns 404 for valid account

- **Check**: Account belongs to the authenticated user (userId match)
- **Check**: JWT token is valid and contains correct user ID
- **Check**: Database query includes `&& a.UserId == userId` filter

#### Form doesn't close after save

- **Check**: `showFormDialog.set(false)` is called after successful save
- **Check**: Store update success callback is firing
- **Check**: No errors in console preventing state update

---

### Performance Notes

- **Modal rendering**: PrimeNG Dialog lazy-loads content - form only rendered when modal opens
- **List updates**: NgRx SignalStore uses efficient immutable updates
- **Delete operation**: Single database query + delete (O(1) complexity)

**Expected performance**:

- Modal open: <100ms
- Form submission: <2s (including API round trip)
- List refresh: <100ms (local state update)

---

### Next Steps After Implementation

1. **Merge to main**: After testing, merge feature branch `003-align-accounts-design`
2. **Deploy**: Follow standard deployment process
3. **Monitor**: Watch for errors in production logs
4. **User feedback**: Collect feedback on new modal workflow
5. **Documentation**: Update user guides if necessary

---

## Additional Resources

- **PrimeNG Dialog**: https://primeng.org/dialog
- **PrimeNG ConfirmDialog**: https://primeng.org/confirmdialog
- **NgRx SignalStore**: https://ngrx.io/guide/signals/signal-store
- **Angular Standalone Components**: https://angular.dev/guide/components
- **ASP.NET Core REST APIs**: https://learn.microsoft.com/en-us/aspnet/core/web-api/

---

## Support

For questions or issues:

- Check the [research.md](research.md) for design decisions
- Review [data-model.md](data-model.md) for entity details
- See [contracts/](contracts/) for API specifications
- Consult [AGENTS.md](../../AGENTS.md) for project guidelines
