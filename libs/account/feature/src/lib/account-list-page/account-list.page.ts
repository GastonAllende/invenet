import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import {
  AccountsStore,
  ActiveAccountStore,
} from '@invenet/account-data-access';
import { AccountListComponent } from '@invenet/account-ui';

type PendingOperation = 'archive' | 'unarchive' | null;

@Component({
  selector: 'lib-account-list-page',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    ConfirmDialogModule,
    AccountListComponent,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="account-shell entity-shell">
      <p-toast></p-toast>
      <p-confirmDialog></p-confirmDialog>
      <lib-account-list
        [accounts]="accounts()"
        [activeAccountId]="activeAccountId()"
        [includeArchived]="includeArchived()"
        [isLoading]="isLoading()"
        (includeArchivedChange)="onIncludeArchivedChange($event)"
        (create)="onCreateAccount()"
        (viewClicked)="onViewAccount($event)"
        (setActiveClicked)="onSetActiveAccount($event)"
        (archiveClicked)="onArchiveAccount($event)"
        (unarchiveClicked)="onUnarchiveAccount($event)"
      ></lib-account-list>
    </div>
  `,
})
export class AccountListPage {
  private readonly store = inject(AccountsStore);
  private readonly activeAccountStore = inject(ActiveAccountStore);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly accounts = this.store.entities;
  readonly activeAccounts = this.store.activeAccounts;
  readonly activeAccountId = this.activeAccountStore.activeAccountId;
  readonly isLoading = this.store.isLoading;
  readonly error = this.store.error;

  readonly includeArchived = signal(false);
  private readonly pendingOperation = signal<PendingOperation>(null);

  constructor() {
    this.activeAccountStore.initializeFromStorage();
    this.store.loadAccounts({ includeArchived: false });

    effect(() => {
      const activeIds = this.activeAccounts().map((a) => a.id);
      this.activeAccountStore.syncWithAccounts(activeIds);
    });

    effect(() => {
      const error = this.error();
      if (!error) return;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error,
        life: 5000,
      });
      this.store.clearError();
      this.pendingOperation.set(null);
    });

    effect(() => {
      if (this.isLoading()) return;
      const operation = this.pendingOperation();
      if (!operation) return;

      if (operation === 'archive') {
        this.store.loadAccounts({ includeArchived: this.includeArchived() });
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Account archived',
          life: 3000,
        });
      }
      if (operation === 'unarchive') {
        this.store.loadAccounts({ includeArchived: this.includeArchived() });
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Account restored',
          life: 3000,
        });
      }
      this.pendingOperation.set(null);
    });

    effect(() => {
      if (this.isLoading()) return;
      if (this.pendingOperation()) return;
      if (this.accounts().length === 0) {
        void this.router.navigateByUrl('/accounts/new');
      }
    });
  }

  onIncludeArchivedChange(value: boolean): void {
    this.includeArchived.set(value);
    this.store.loadAccounts({ includeArchived: value });
  }

  onCreateAccount(): void {
    void this.router.navigateByUrl('/accounts/new');
  }

  onViewAccount(id: string): void {
    void this.router.navigate(['/accounts', id]);
  }

  onSetActiveAccount(id: string): void {
    this.activeAccountStore.setActiveAccount(id);
    this.store.setActiveAccountOnServer(id);
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Active account updated',
      life: 2500,
    });
  }

  onArchiveAccount(id: string): void {
    this.confirmationService.confirm({
      header: 'Archive Account',
      message: 'Archive this account? It will be hidden from default views.',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.pendingOperation.set('archive');
        this.store.archiveAccount(id);
      },
    });
  }

  onUnarchiveAccount(id: string): void {
    this.confirmationService.confirm({
      header: 'Restore Account',
      message: 'Restore this archived account?',
      icon: 'pi pi-info-circle',
      accept: () => {
        this.pendingOperation.set('unarchive');
        this.store.unarchiveAccount(id);
      },
    });
  }
}
