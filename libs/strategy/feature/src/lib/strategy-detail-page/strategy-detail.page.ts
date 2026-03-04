import { Component, DestroyRef, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { StrategiesStore } from '@invenet/strategy-data-access';
import type { StrategyVersionHistoryItem } from '@invenet/strategy-data-access';

@Component({
  selector: 'lib-strategy-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    ConfirmDialogModule,
    CardModule,
    TableModule,
    TagModule,
    ButtonModule,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="strategy-shell entity-shell">
      <p-toast></p-toast>
      <p-confirmDialog></p-confirmDialog>

      @if (selectedStrategy(); as strategy) {
        <div class="strategy-detail-layout">
          <p-card styleClass="strategy-hero-card">
            <div class="strategy-hero">
              <div class="strategy-identity">
                <div class="strategy-title-row">
                  <h1 class="page-title entity-title strategy-title">
                    <i class="pi pi-sitemap strategy-icon heading-icon"></i>
                    {{ strategy.name }}
                  </h1>
                  <p-tag
                    [value]="strategy.isArchived ? 'ARCHIVED' : 'ACTIVE'"
                    [severity]="strategy.isArchived ? 'contrast' : 'success'"
                  ></p-tag>
                </div>
                <div class="strategy-meta-row">
                  @if (strategy.currentVersion; as currentVersion) {
                    <span class="strategy-meta-label">Current version</span>
                    <span class="strategy-meta-value"
                      >v{{ currentVersion.versionNumber }}</span
                    >
                    <span class="strategy-meta-separator">•</span>
                    <span class="strategy-meta-label">Updated</span>
                    <span class="strategy-meta-value">{{
                      currentVersion.createdAt | date: 'short'
                    }}</span>
                  }
                </div>
              </div>

              <div class="strategy-actions">
                <p-button
                  label="Back to Strategies"
                  icon="pi pi-arrow-left"
                  severity="secondary"
                  [text]="true"
                  (onClick)="onBackToList()"
                ></p-button>
                <p-button
                  label="Edit (New Version)"
                  icon="pi pi-pencil"
                  size="small"
                  [disabled]="strategy.isArchived"
                  (onClick)="onEditNewVersion()"
                ></p-button>
                @if (!strategy.isArchived) {
                  <p-button
                    label="Archive"
                    icon="pi pi-archive"
                    severity="danger"
                    [outlined]="true"
                    size="small"
                    (onClick)="onArchiveStrategy(strategy.id)"
                  ></p-button>
                } @else {
                  <p-button
                    label="Unarchive"
                    icon="pi pi-replay"
                    severity="success"
                    [outlined]="true"
                    size="small"
                    (onClick)="onUnarchiveStrategy(strategy.id)"
                  ></p-button>
                }
              </div>
            </div>
          </p-card>

          <p-card styleClass="strategy-version-card">
            <ng-template pTemplate="title">Current Version</ng-template>
            <ng-template pTemplate="subtitle"
              >Latest ruleset currently attached to this strategy.</ng-template
            >
            @if (strategy.currentVersion; as currentVersion) {
              <div class="version-summary">
                <div class="version-stat">
                  <span class="version-stat-label">Version</span>
                  <span class="version-stat-value"
                    >v{{ currentVersion.versionNumber }}</span
                  >
                </div>
                <div class="version-stat">
                  <span class="version-stat-label">Created At</span>
                  <span class="version-stat-value">{{
                    currentVersion.createdAt | date: 'short'
                  }}</span>
                </div>
              </div>
              <div class="rules-grid">
                <div class="rule-block">
                  <h3>Entry Rules</h3>
                  <p>{{ currentVersion.entryRules }}</p>
                </div>
                <div class="rule-block">
                  <h3>Exit Rules</h3>
                  <p>{{ currentVersion.exitRules }}</p>
                </div>
                <div class="rule-block">
                  <h3>Risk Rules</h3>
                  <p>{{ currentVersion.riskRules }}</p>
                </div>
                <div class="rule-block">
                  <h3>Notes</h3>
                  <p>{{ currentVersion.notes || '—' }}</p>
                </div>
              </div>
            } @else {
              <p>No version available.</p>
            }
          </p-card>

          <p-card styleClass="strategy-history-card">
            <ng-template pTemplate="title">Version History</ng-template>
            <p-table
              styleClass="strategy-history-table"
              [value]="strategy.versions"
              [tableStyle]="{ 'min-width': '36rem' }"
            >
              <ng-template pTemplate="header">
                <tr>
                  <th>Version</th>
                  <th>Created At</th>
                  <th>Created By</th>
                  <th>Action</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-version>
                <tr>
                  <td>v{{ version.versionNumber }}</td>
                  <td>{{ version.createdAt | date: 'short' }}</td>
                  <td>
                    <span class="created-by">{{
                      formatUserId(version.createdByUserId)
                    }}</span>
                  </td>
                  <td>
                    <p-button
                      icon="pi pi-eye"
                      [rounded]="true"
                      [text]="true"
                      severity="secondary"
                      (onClick)="onSelectVersion(version)"
                    ></p-button>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </p-card>
        </div>
      }
    </div>
  `,
  styleUrls: ['./strategy-detail.page.css'],
})
export class StrategyDetailPage {
  private readonly store = inject(StrategiesStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  private readonly strategyId = this.route.snapshot.paramMap.get('id');

  readonly selectedStrategy = this.store.selectedDetail;
  readonly error = this.store.error;

  constructor() {
    const destroyRef = inject(DestroyRef);

    if (this.strategyId) {
      this.store.loadStrategyDetail({ id: this.strategyId });
    }

    this.route.queryParamMap
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe((params) => {
        const raw = params.get('version');
        const parsed = raw ? Number(raw) : null;
        const version = parsed && Number.isFinite(parsed) ? parsed : undefined;
        if (this.strategyId) {
          this.store.loadStrategyDetail({ id: this.strategyId, version });
        }
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
    });
  }

  onBackToList(): void {
    void this.router.navigateByUrl('/strategies');
  }

  onEditNewVersion(): void {
    if (this.strategyId) {
      void this.router.navigate(['/strategies', this.strategyId, 'edit']);
    }
  }

  onArchiveStrategy(id: string): void {
    this.confirmationService.confirm({
      header: 'Archive Strategy',
      message:
        'Archive this strategy? You will not be able to create new versions while archived.',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.store.archiveStrategy(id);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Strategy archived',
          life: 2500,
        });
      },
    });
  }

  onUnarchiveStrategy(id: string): void {
    this.confirmationService.confirm({
      header: 'Unarchive Strategy',
      message: 'Unarchive this strategy?',
      icon: 'pi pi-info-circle',
      accept: () => {
        this.store.unarchiveStrategy(id);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Strategy unarchived',
          life: 2500,
        });
      },
    });
  }

  onSelectVersion(item: StrategyVersionHistoryItem): void {
    if (!this.strategyId) return;
    void this.router.navigate(['/strategies', this.strategyId], {
      queryParams: { version: item.versionNumber },
    });
  }

  formatUserId(userId: string | null | undefined): string {
    if (!userId) return '—';
    if (userId.length <= 14) return userId;
    return `${userId.slice(0, 8)}…${userId.slice(-4)}`;
  }
}
