import { Component, OnInit, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Toast } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
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
    DialogModule,
    ConfirmDialogModule,
    AccountFormComponent,
    AccountListComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './accounts-shell.component.html',
  styleUrl: './accounts-shell.component.css',
})
export class AccountsShellComponent implements OnInit {
  accountsStore = inject(AccountsStore);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);

  includeArchived = signal(false);
  lastOperationType = signal<'create' | 'update' | 'delete' | null>(null);

  // Modal state
  showFormDialog = signal(false);
  selectedAccount = signal<GetAccountResponse | null>(null);

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
          let message = '';
          switch (lastOp) {
            case 'create':
              message = 'Account created successfully';
              break;
            case 'update':
              message = 'Account updated successfully';
              break;
            case 'delete':
              message = 'Account deleted successfully';
              break;
          }
          if (message) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: message,
              life: 3000,
            });
          }
        }
        this.lastOperationType.set(null);
      }
    });
  }

  ngOnInit(): void {
    this.accountsStore.loadAccounts({ includeArchived: false });
  }

  onCreateAccount(): void {
    this.selectedAccount.set(null);
    this.showFormDialog.set(true);
  }

  onEditAccount(account: GetAccountResponse): void {
    this.selectedAccount.set(account);
    this.showFormDialog.set(true);
  }

  onSaveAccount(request: CreateAccountRequest | UpdateAccountRequest): void {
    const selected = this.selectedAccount();

    if (selected) {
      // Update existing account
      this.lastOperationType.set('update');
      this.accountsStore.updateAccount({
        id: selected.id,
        payload: request as UpdateAccountRequest,
      });
    } else {
      // Create new account
      this.lastOperationType.set('create');
      this.accountsStore.createAccount(request as CreateAccountRequest);
    }
    this.showFormDialog.set(false);
  }

  onCancelForm(): void {
    this.showFormDialog.set(false);
    this.selectedAccount.set(null);
  }

  onDeleteAccount(id: string): void {
    const account = this.accountsStore
      .entities()
      .find((a: GetAccountResponse) => a.id === id);

    if (!account) return;

    this.confirmationService.confirm({
      message: `Are you sure you want to delete the account '${account.name}'? This action cannot be undone.`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.lastOperationType.set('delete');
        this.accountsStore.deleteAccount(id);
      },
    });
  }

  handleIncludeArchivedChange(value: boolean): void {
    this.includeArchived.set(value);
    this.accountsStore.loadAccounts({ includeArchived: value });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleAccountSelected(_id: string): void {
    // Future enhancement: navigate to account detail view
  }

  handleEditClicked(id: string): void {
    const account =
      this.accountsStore
        .entities()
        .find((a: GetAccountResponse) => a.id === id) || null;
    if (account) {
      this.onEditAccount(account);
    }
  }

  handleDeleteClicked(id: string): void {
    this.onDeleteAccount(id);
  }

  handleArchiveClicked(id: string): void {
    this.accountsStore.archiveAccount(id);
  }
}
