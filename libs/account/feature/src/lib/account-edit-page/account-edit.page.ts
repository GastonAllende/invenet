import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AccountsStore } from '@invenet/account-data-access';
import type { UpdateAccountRequest } from '@invenet/account-data-access';
import { AccountFormComponent } from '@invenet/account-ui';

@Component({
  selector: 'lib-account-edit-page',
  standalone: true,
  imports: [CommonModule, ToastModule, AccountFormComponent],
  providers: [MessageService],
  template: `
    <div class="account-shell entity-shell">
      <p-toast></p-toast>
      <section class="page-header entity-header">
        <h1 class="page-title entity-title">Edit Account</h1>
        <p class="page-subtitle entity-subtitle">
          Update your account settings and risk rules.
        </p>
      </section>
      <lib-invenet-account-form
        [account]="selectedAccount() ?? null"
        [mode]="'update'"
        [isLoading]="isLoading()"
        [showTitle]="false"
        [showCancel]="true"
        (formSubmit)="onSave($event)"
        (formCancel)="onCancel()"
      ></lib-invenet-account-form>
    </div>
  `,
})
export class AccountEditPage {
  private readonly store = inject(AccountsStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  private readonly accountId = this.route.snapshot.paramMap.get('id');

  readonly selectedAccount = this.store.selectedAccount;
  readonly isLoading = this.store.isLoading;
  readonly error = this.store.error;

  private readonly pendingUpdate = signal(false);

  constructor() {
    if (!this.accountId) {
      void this.router.navigateByUrl('/accounts');
      return;
    }

    this.store.selectAccount(this.accountId);
    if (!this.store.entities().some((a) => a.id === this.accountId)) {
      this.store.loadAccount(this.accountId);
    }

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
      this.pendingUpdate.set(false);
    });

    effect(() => {
      if (!this.pendingUpdate()) return;
      if (this.isLoading()) return;
      this.pendingUpdate.set(false);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Account updated',
        life: 2500,
      });
      void this.router.navigate(['/accounts', this.accountId]);
    });
  }

  onSave(request: UpdateAccountRequest): void {
    if (!this.accountId) return;
    this.pendingUpdate.set(true);
    this.store.updateAccount({ id: this.accountId, payload: request });
  }

  onCancel(): void {
    void this.router.navigate(['/accounts', this.accountId]);
  }
}
