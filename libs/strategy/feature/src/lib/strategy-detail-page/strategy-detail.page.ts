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
    <div class="flex flex-col gap-5">
      <p-toast></p-toast>
      <p-confirmDialog></p-confirmDialog>

      @if (selectedStrategy(); as strategy) {
        <div class="flex flex-col gap-4">
          <p-card>
            <div class="flex justify-between items-start gap-4">
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2 flex-wrap">
                  <h1
                    class="m-0 text-4xl font-bold text-color inline-flex items-center gap-2"
                  >
                    <i class="pi pi-sitemap text-primary-color text-xl"></i>
                    {{ strategy.name }}
                  </h1>
                  <p-tag
                    [value]="strategy.isArchived ? 'ARCHIVED' : 'ACTIVE'"
                    [severity]="strategy.isArchived ? 'contrast' : 'success'"
                  ></p-tag>
                </div>
                <div class="flex items-center gap-2 flex-wrap text-muted-color">
                  @if (strategy.currentVersion; as currentVersion) {
                    <span
                      class="text-xs uppercase tracking-wider text-muted-color"
                      >Current version</span
                    >
                    <span class="text-sm font-semibold text-color"
                      >v{{ currentVersion.versionNumber }}</span
                    >
                    <span class="text-muted-color mx-1">•</span>
                    <span
                      class="text-xs uppercase tracking-wider text-muted-color"
                      >Updated</span
                    >
                    <span class="text-sm font-semibold text-color">{{
                      currentVersion.createdAt | date: 'short'
                    }}</span>
                  }
                </div>
              </div>

              <div class="inline-flex items-center gap-2 flex-wrap self-start">
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

          <p-card>
            <ng-template pTemplate="title">Current Version</ng-template>
            <ng-template pTemplate="subtitle"
              >Latest ruleset currently attached to this strategy.</ng-template
            >
            @if (strategy.currentVersion; as currentVersion) {
              <div class="grid grid-cols-2 gap-3 mb-4">
                <div
                  class="p-3 border border-surface-border rounded flex flex-col gap-1 bg-surface-50"
                >
                  <span
                    class="text-xs uppercase tracking-wider text-muted-color"
                    >Version</span
                  >
                  <span class="text-base font-semibold text-color"
                    >v{{ currentVersion.versionNumber }}</span
                  >
                </div>
                <div
                  class="p-3 border border-surface-border rounded flex flex-col gap-1 bg-surface-50"
                >
                  <span
                    class="text-xs uppercase tracking-wider text-muted-color"
                    >Created At</span
                  >
                  <span class="text-base font-semibold text-color">{{
                    currentVersion.createdAt | date: 'short'
                  }}</span>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div
                  class="border border-surface-border rounded p-4 flex flex-col gap-2"
                >
                  <h3 class="m-0 text-sm font-semibold text-color">
                    Entry Rules
                  </h3>
                  <p class="m-0 whitespace-pre-wrap text-muted-color text-sm">
                    {{ currentVersion.entryRules }}
                  </p>
                </div>
                <div
                  class="border border-surface-border rounded p-4 flex flex-col gap-2"
                >
                  <h3 class="m-0 text-sm font-semibold text-color">
                    Exit Rules
                  </h3>
                  <p class="m-0 whitespace-pre-wrap text-muted-color text-sm">
                    {{ currentVersion.exitRules }}
                  </p>
                </div>
                <div
                  class="border border-surface-border rounded p-4 flex flex-col gap-2"
                >
                  <h3 class="m-0 text-sm font-semibold text-color">
                    Risk Rules
                  </h3>
                  <p class="m-0 whitespace-pre-wrap text-muted-color text-sm">
                    {{ currentVersion.riskRules }}
                  </p>
                </div>
                <div
                  class="border border-surface-border rounded p-4 flex flex-col gap-2"
                >
                  <h3 class="m-0 text-sm font-semibold text-color">Notes</h3>
                  <p class="m-0 whitespace-pre-wrap text-muted-color text-sm">
                    {{ currentVersion.notes || '—' }}
                  </p>
                </div>
              </div>
            } @else {
              <p>No version available.</p>
            }
          </p-card>

          <p-card>
            <ng-template pTemplate="title">Version History</ng-template>
            <p-table
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
                    <span class="font-mono text-xs text-muted-color">{{
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
