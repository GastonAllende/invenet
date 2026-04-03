import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import {
  AccountsStore,
  ActiveAccountStore,
} from '@invenet/account-data-access';

@Component({
  selector: 'lib-account-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    ConfirmDialogModule,
    ButtonModule,
    CardModule,
    DividerModule,
    TagModule,
  ],
  providers: [MessageService, ConfirmationService],
  styleUrl: './account-detail.page.css',
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    @if (selectedAccount(); as account) {
      <div class="flex flex-col gap-4">
        <p-card>
          <div class="flex justify-between items-start gap-4">
            <div class="flex flex-col gap-2">
              <h1 class="m-0 text-4xl font-bold text-color inline-flex items-center gap-2">
                <i class="pi pi-wallet text-primary-color text-xl"></i>
                {{ account.name }}
              </h1>
              <p class="m-0 text-muted-color inline-flex items-center gap-2">
                <i class="pi pi-dollar text-sm"></i>
                Base currency {{ account.baseCurrency }}
              </p>
              <div class="flex gap-2 flex-wrap">
                @if (activeAccountId() === account.id) {
                  <p-tag value="Active Account" severity="success"></p-tag>
                }
                @if (!account.isActive) {
                  <p-tag value="Archived" severity="contrast"></p-tag>
                }
                <p-tag
                  [value]="'Type: ' + account.accountType"
                  severity="secondary"
                ></p-tag>
              </div>
            </div>

            <div class="inline-flex items-center gap-2 flex-wrap self-start">
              <p-button
                label="Back to Accounts"
                icon="pi pi-arrow-left"
                severity="secondary"
                [text]="true"
                (onClick)="onBackToList()"
              ></p-button>
              <p-button
                label="Edit"
                icon="pi pi-pencil"
                size="small"
                (onClick)="onEdit()"
              ></p-button>
              @if (activeAccountId() !== account.id) {
                <p-button
                  label="Set Active"
                  icon="pi pi-star"
                  severity="secondary"
                  [outlined]="true"
                  size="small"
                  (onClick)="onSetActiveAccount(account.id)"
                ></p-button>
              }
              @if (account.isActive) {
                <p-button
                  label="Archive"
                  icon="pi pi-archive"
                  severity="danger"
                  [outlined]="true"
                  size="small"
                  (onClick)="onArchiveAccount(account.id)"
                ></p-button>
              } @else {
                <p-button
                  label="Unarchive"
                  icon="pi pi-replay"
                  severity="success"
                  [outlined]="true"
                  size="small"
                  (onClick)="onUnarchiveAccount(account.id)"
                ></p-button>
              }
            </div>
          </div>
        </p-card>

        <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <p-card>
            <ng-template pTemplate="title">Risk Summary</ng-template>
            <ng-template pTemplate="subtitle">
              Configured limits for this account.
            </ng-template>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-1 p-4 border border-surface-border rounded bg-surface-50">
                <span class="text-2xl font-bold text-color"
                  >{{ account.riskSettings.riskPerTradePct }}%</span
                >
                <span class="text-xs uppercase tracking-wider text-muted-color">Risk per trade</span>
              </div>
              <div class="flex flex-col gap-1 p-4 border border-surface-border rounded bg-surface-50">
                <span class="text-2xl font-bold text-color"
                  >{{ account.riskSettings.maxDailyLossPct }}%</span
                >
                <span class="text-xs uppercase tracking-wider text-muted-color">Max daily loss</span>
              </div>
              <div class="flex flex-col gap-1 p-4 border border-surface-border rounded bg-surface-50">
                <span class="text-2xl font-bold text-color"
                  >{{ account.riskSettings.maxWeeklyLossPct }}%</span
                >
                <span class="text-xs uppercase tracking-wider text-muted-color">Max weekly loss</span>
              </div>
              <div class="flex flex-col gap-1 p-4 border border-surface-border rounded bg-surface-50">
                <span class="text-2xl font-bold text-color">-</span>
                <span class="text-xs uppercase tracking-wider text-muted-color">Portfolio exposure cap</span>
              </div>
            </div>
          </p-card>

          <p-card>
            <ng-template pTemplate="title">Account Details</ng-template>
            <ng-template pTemplate="subtitle"
              >Profile and metadata.</ng-template
            >
            <div class="flex flex-col">
              <div class="flex justify-between items-start gap-4 py-2">
                <span class="text-xs uppercase tracking-wider text-muted-color">Broker</span>
                <span class="font-medium text-color text-right">{{
                  account.broker || 'Not specified'
                }}</span>
              </div>
              <p-divider></p-divider>
              <div class="flex justify-between items-start gap-4 py-2">
                <span class="text-xs uppercase tracking-wider text-muted-color">Account type</span>
                <span class="font-medium text-color text-right">{{ account.accountType }}</span>
              </div>
              <p-divider></p-divider>
              <div class="flex flex-col gap-2 py-2">
                <span class="text-xs uppercase tracking-wider text-muted-color">Notes</span>
                <span class="font-medium text-color text-right">{{
                  account.notes || 'No notes provided'
                }}</span>
              </div>
            </div>
          </p-card>
        </section>
      </div>
    }
  `,
})
export class AccountDetailPage {
  private readonly store = inject(AccountsStore);
  private readonly activeAccountStore = inject(ActiveAccountStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  private readonly accountId = this.route.snapshot.paramMap.get('id');

  readonly selectedAccount = this.store.selectedAccount;
  readonly activeAccountId = this.activeAccountStore.activeAccountId;
  readonly isLoading = this.store.isLoading;
  readonly error = this.store.error;

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
    });
  }

  onBackToList(): void {
    void this.router.navigateByUrl('/accounts');
  }

  onEdit(): void {
    void this.router.navigate(['/accounts', this.accountId, 'edit']);
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
        this.store.archiveAccount(id);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Account archived',
          life: 3000,
        });
      },
    });
  }

  onUnarchiveAccount(id: string): void {
    this.confirmationService.confirm({
      header: 'Restore Account',
      message: 'Restore this archived account?',
      icon: 'pi pi-info-circle',
      accept: () => {
        this.store.unarchiveAccount(id);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Account restored',
          life: 3000,
        });
      },
    });
  }
}
