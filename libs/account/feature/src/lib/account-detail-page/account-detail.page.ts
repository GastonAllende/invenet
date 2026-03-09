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
      <div class="account-detail-layout">
        <p-card styleClass="account-hero-card">
          <div class="account-hero">
            <div class="account-hero-main">
              <h1 class="account-title entity-title">
                <i class="pi pi-wallet account-icon heading-icon"></i>
                {{ account.name }}
              </h1>
              <p class="account-meta">
                <i class="pi pi-dollar account-icon"></i>
                Base currency {{ account.baseCurrency }}
              </p>
              <div class="account-tags">
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

            <div class="account-actions">
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

        <section class="overview-grid">
          <p-card styleClass="detail-card">
            <ng-template pTemplate="title">Risk Summary</ng-template>
            <ng-template pTemplate="subtitle">
              Configured limits for this account.
            </ng-template>
            <div class="risk-metrics">
              <div class="metric-tile">
                <span class="metric-value"
                  >{{ account.riskSettings.riskPerTradePct }}%</span
                >
                <span class="metric-label">Risk per trade</span>
              </div>
              <div class="metric-tile">
                <span class="metric-value"
                  >{{ account.riskSettings.maxDailyLossPct }}%</span
                >
                <span class="metric-label">Max daily loss</span>
              </div>
              <div class="metric-tile">
                <span class="metric-value"
                  >{{ account.riskSettings.maxWeeklyLossPct }}%</span
                >
                <span class="metric-label">Max weekly loss</span>
              </div>
              <div class="metric-tile">
                <span class="metric-value">-</span>
                <span class="metric-label">Portfolio exposure cap</span>
              </div>
            </div>
          </p-card>

          <p-card styleClass="detail-card">
            <ng-template pTemplate="title">Account Details</ng-template>
            <ng-template pTemplate="subtitle"
              >Profile and metadata.</ng-template
            >
            <div class="detail-list">
              <div class="detail-row">
                <span class="detail-label">Broker</span>
                <span class="detail-value">{{
                  account.broker || 'Not specified'
                }}</span>
              </div>
              <p-divider></p-divider>
              <div class="detail-row">
                <span class="detail-label">Account type</span>
                <span class="detail-value">{{ account.accountType }}</span>
              </div>
              <p-divider></p-divider>
              <div class="detail-row detail-row-notes">
                <span class="detail-label">Notes</span>
                <span class="detail-value">{{
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
