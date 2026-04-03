import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import {
  AccountsStore,
  ActiveAccountStore,
} from '@invenet/account-data-access';
import type {
  CreateAccountRequest,
  UpdateAccountRequest,
} from '@invenet/account-data-access';
import { AccountFormComponent } from '@invenet/account-ui';

@Component({
  selector: 'lib-account-new-page',
  standalone: true,
  imports: [CommonModule, ToastModule, AccountFormComponent],
  providers: [MessageService],
  template: `
    <div class="flex flex-col gap-5">
      <p-toast></p-toast>
      <section class="bg-surface-card border border-surface-border rounded p-6">
        <h1 class="text-3xl font-semibold m-0 text-color">Create Account</h1>
        <p class="m-0 text-muted-color">
          Define your risk rules before logging trades.
        </p>
      </section>
      <lib-invenet-account-form
        [mode]="'create'"
        [isLoading]="isLoading()"
        [showTitle]="false"
        [showCancel]="!isOnboarding()"
        (formSubmit)="onSave($event)"
        (formCancel)="onCancel()"
      ></lib-invenet-account-form>
    </div>
  `,
})
export class AccountNewPage {
  private readonly store = inject(AccountsStore);
  private readonly activeAccountStore = inject(ActiveAccountStore);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  readonly isLoading = this.store.isLoading;
  readonly error = this.store.error;
  readonly activeAccounts = this.store.activeAccounts;

  readonly isOnboarding = computed(() => this.activeAccounts().length === 0);

  private readonly pendingCreate = signal(false);

  constructor() {
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
      this.pendingCreate.set(false);
    });

    effect(() => {
      if (!this.pendingCreate()) return;
      if (this.isLoading()) return;
      const account = this.store.selectedAccount();
      if (!account) return;
      this.pendingCreate.set(false);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Account created',
        life: 2500,
      });
      void this.router.navigate(['/accounts', account.id]);
    });
  }

  onSave(request: CreateAccountRequest | UpdateAccountRequest): void {
    this.pendingCreate.set(true);
    this.store.createAccount(request as CreateAccountRequest);
  }

  onCancel(): void {
    void this.router.navigateByUrl('/accounts');
  }
}
