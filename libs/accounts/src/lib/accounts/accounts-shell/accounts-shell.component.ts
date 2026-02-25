import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import {
  CreateAccountRequest,
  UpdateAccountRequest,
} from '../../../data-access/src/lib/models/account.model';
import { ActiveAccountStore } from '../../../data-access/src/lib/store/active-account.store';
import { AccountsStore } from '../../../data-access/src/lib/store/accounts.store';
import { AccountFormComponent } from '../../ui/account-form/account-form.component';
import { AccountListComponent } from '../../ui/account-list/account-list.component';

type AccountRouteMode = 'list' | 'new' | 'detail';
type PendingOperation = 'create' | 'update' | 'archive' | 'unarchive' | null;

@Component({
  selector: 'lib-invenet-accounts-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    Toast,
    ConfirmDialogModule,
    AccountFormComponent,
    AccountListComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './accounts-shell.component.html',
  styleUrl: './accounts-shell.component.css',
})
export class AccountsShellComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly accountsStore = inject(AccountsStore);
  readonly activeAccountStore = inject(ActiveAccountStore);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly routeMode = signal<AccountRouteMode>('list');
  readonly routeAccountId = signal<string | null>(null);
  readonly editMode = signal(false);
  readonly includeArchived = signal(false);
  readonly pendingOperation = signal<PendingOperation>(null);

  readonly accounts = this.accountsStore.entities;
  readonly activeAccounts = this.accountsStore.activeAccounts;
  readonly selectedAccount = this.accountsStore.selectedAccount;
  readonly isLoading = this.accountsStore.isLoading;
  readonly error = this.accountsStore.error;
  readonly activeAccountId = this.activeAccountStore.activeAccountId;
  readonly activeAccount = this.activeAccountStore.activeAccount;

  readonly isListMode = computed(() => this.routeMode() === 'list');
  readonly isCreateMode = computed(() => this.routeMode() === 'new');
  readonly isDetailMode = computed(() => this.routeMode() === 'detail');
  readonly isOnboarding = computed(
    () => this.isCreateMode() && this.activeAccounts().length === 0,
  );

  constructor() {
    effect(() => {
      const currentError = this.error();
      if (!currentError) {
        return;
      }

      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: currentError,
        life: 5000,
      });

      this.accountsStore.clearError();
      this.pendingOperation.set(null);
    });

    effect(() => {
      const activeIds = this.activeAccounts().map((account) => account.id);
      this.activeAccountStore.syncWithAccounts(activeIds);
    });

    effect(() => {
      const operation = this.pendingOperation();
      if (!operation || this.isLoading() || this.error()) {
        return;
      }

      if (operation === 'create') {
        const newId = this.accountsStore.selectedAccountId();
        if (!newId) {
          this.pendingOperation.set(null);
          return;
        }

        this.activeAccountStore.setActiveAccount(newId);
        this.accountsStore.setActiveAccountOnServer(newId);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Account created and set as active.',
          life: 3000,
        });
        void this.router.navigate(['/accounts', newId]);
      }

      if (operation === 'update') {
        this.editMode.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Account updated',
          life: 3000,
        });
      }

      if (operation === 'archive') {
        this.accountsStore.loadAccounts({
          includeArchived: this.includeArchived(),
        });
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Account archived',
          life: 3000,
        });
      }

      if (operation === 'unarchive') {
        this.accountsStore.loadAccounts({
          includeArchived: this.includeArchived(),
        });
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
      const mode = this.routeMode();
      const accountId = this.routeAccountId();
      const loading = this.isLoading();
      const accounts = this.accounts();

      if (loading) {
        return;
      }

      if (mode === 'list' && accounts.length === 0) {
        void this.router.navigateByUrl('/accounts/new');
        return;
      }

      if (mode === 'detail') {
        if (!accountId) {
          void this.router.navigateByUrl('/accounts');
          return;
        }

        this.accountsStore.selectAccount(accountId);
        if (!accounts.some((item) => item.id === accountId)) {
          this.accountsStore.loadAccount(accountId);
        }
      }
    });
  }

  ngOnInit(): void {
    this.activeAccountStore.initializeFromStorage();
    this.accountsStore.loadAccounts({ includeArchived: this.includeArchived() });

    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
      this.routeMode.set((data['accountMode'] as AccountRouteMode) ?? 'list');
      this.editMode.set(false);
    });

    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.routeAccountId.set(params.get('id'));
      });
  }

  onIncludeArchivedChange(value: boolean): void {
    this.includeArchived.set(value);
    this.accountsStore.loadAccounts({ includeArchived: value });
  }

  onCreateAccount(): void {
    void this.router.navigateByUrl('/accounts/new');
  }

  onViewAccount(id: string): void {
    void this.router.navigate(['/accounts', id]);
  }

  onEnterEditMode(): void {
    this.editMode.set(true);
  }

  onSetActiveAccount(id: string): void {
    this.activeAccountStore.setActiveAccount(id);
    this.accountsStore.setActiveAccountOnServer(id);
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
        this.accountsStore.archiveAccount(id);
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
        this.accountsStore.unarchiveAccount(id);
      },
    });
  }

  onSaveAccount(request: CreateAccountRequest | UpdateAccountRequest): void {
    if (this.isCreateMode()) {
      this.pendingOperation.set('create');
      this.accountsStore.createAccount(request as CreateAccountRequest);
      return;
    }

    const selected = this.selectedAccount();
    if (!selected) {
      return;
    }

    this.pendingOperation.set('update');
    this.accountsStore.updateAccount({
      id: selected.id,
      payload: request as UpdateAccountRequest,
    });
  }

  onCancelForm(): void {
    if (this.isDetailMode()) {
      this.editMode.set(false);
      return;
    }

    if (this.isCreateMode()) {
      void this.router.navigateByUrl('/accounts');
    }
  }
}
