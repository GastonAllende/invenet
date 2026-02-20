import {
  Component,
  OnInit,
  signal,
  computed,
  inject,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AccountFormComponent } from '../../ui/account-form/account-form.component';
import { AccountListComponent } from '../../ui/account-list/account-list.component';
import { AccountsStore } from '../../../data-access/src/lib/store/accounts.store';
import {
  CreateAccountRequest,
  GetAccountResponse,
  UpdateAccountRequest,
} from '../../../data-access/src/lib/models/account.model';

/**
 * Shell component for accounts management
 */
@Component({
  selector: 'lib-invenet-accounts-shell',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    Toast,
    AccountFormComponent,
    AccountListComponent,
  ],
  providers: [MessageService],
  templateUrl: './accounts-shell.component.html',
  styleUrl: './accounts-shell.component.css',
})
export class AccountsShellComponent implements OnInit {
  accountsStore = inject(AccountsStore);
  messageService = inject(MessageService);

  createMode = signal(false);
  editMode = signal(false);
  selectedAccountId = signal<string | null>(null);
  includeArchived = signal(false);
  lastOperationType = signal<'create' | 'update' | null>(null);

  selectedAccount = computed(() => {
    const id = this.selectedAccountId();
    if (!id) return null;
    return (
      this.accountsStore
        .entities()
        .find((a: GetAccountResponse) => a.id === id) || null
    );
  });

  formMode = computed(() => (this.editMode() ? 'update' : 'create'));

  constructor() {
    // Effect to show error toasts
    effect(() => {
      const error = this.accountsStore.error();
      if (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error,
          life: 5000,
        });
        // Clear error after showing
        setTimeout(() => this.accountsStore.clearError(), 100);
      }
    });

    // Effect to show success toasts
    effect(() => {
      const isLoading = this.accountsStore.isLoading();
      const lastOp = this.lastOperationType();

      // When loading completes and there's no error, show success
      if (!isLoading && lastOp) {
        const error = this.accountsStore.error();
        if (!error) {
          const message =
            lastOp === 'create'
              ? 'Account created successfully'
              : 'Account updated successfully';
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: message,
            life: 3000,
          });
        }
        this.lastOperationType.set(null);
      }
    });
  }

  ngOnInit(): void {
    this.accountsStore.loadAccounts({ includeArchived: false });
  }

  showCreateForm(): void {
    this.editMode.set(false);
    this.selectedAccountId.set(null);
    this.createMode.set(true);
  }

  showEditForm(id: string): void {
    this.accountsStore.loadAccount(id);
    this.selectedAccountId.set(id);
    this.editMode.set(true);
    this.createMode.set(true); // Reuse createMode for showing form
  }

  handleFormSubmit(request: CreateAccountRequest | UpdateAccountRequest): void {
    if (this.editMode()) {
      const id = this.selectedAccountId();
      if (id) {
        this.lastOperationType.set('update');
        this.accountsStore.updateAccount({
          id,
          payload: request as UpdateAccountRequest,
        });
      }
    } else {
      this.lastOperationType.set('create');
      this.accountsStore.createAccount(request as CreateAccountRequest);
    }
    this.handleCancel();
  }

  handleCancel(): void {
    this.createMode.set(false);
    this.editMode.set(false);
    this.selectedAccountId.set(null);
  }

  handleIncludeArchivedChange(value: boolean): void {
    this.includeArchived.set(value);
    this.accountsStore.loadAccounts({ includeArchived: value });
  }

  handleAccountSelected(_id: string): void {
    // Future enhancement: navigate to account detail view
  }

  handleEditClicked(id: string): void {
    this.showEditForm(id);
  }

  handleArchiveClicked(_id: string): void {
    // Will implement in US4 (Archive Account)
  }
}
