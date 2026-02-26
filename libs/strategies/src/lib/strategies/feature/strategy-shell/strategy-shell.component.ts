import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
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
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { StrategiesStore } from '../../data-access/strategies.store';
import type {
  CreateStrategyRequest,
  CreateStrategyVersionRequest,
  StrategyVersionHistoryItem,
} from '../../data-access/models';
import { StrategyFormComponent } from '../../ui/strategy-form/strategy-form.component';
import { StrategyListComponent } from '../../ui/strategy-list/strategy-list.component';

type StrategyMode = 'list' | 'new' | 'detail' | 'edit';

@Component({
  selector: 'lib-strategy-shell',
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    MessageModule,
    TableModule,
    TagModule,
    StrategyListComponent,
    StrategyFormComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './strategy-shell.component.html',
  styleUrls: ['./strategy-shell.component.css'],
})
export class StrategyShellComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly store = inject(StrategiesStore);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly mode = signal<StrategyMode>('list');
  readonly strategyId = signal<string | null>(null);
  readonly selectedVersionNumber = signal<number | null>(null);

  readonly strategies = this.store.entities;
  readonly selectedStrategy = this.store.selectedDetail;
  readonly isLoading = this.store.isLoading;
  readonly error = this.store.error;

  readonly includeArchived = signal(false);

  readonly isListMode = computed(() => this.mode() === 'list');
  readonly isNewMode = computed(() => this.mode() === 'new');
  readonly isDetailMode = computed(() => this.mode() === 'detail');
  readonly isEditMode = computed(() => this.mode() === 'edit');

  constructor() {
    effect(() => {
      const id = this.store.lastCreatedStrategyId();
      if (!id) {
        return;
      }

      this.store.clearLastCreatedStrategyId();
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Strategy created',
        life: 2500,
      });
      void this.router.navigate(['/strategies', id]);
    });

    effect(() => {
      const error = this.error();
      if (!error) {
        return;
      }

      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error,
        life: 5000,
      });
      this.store.clearError();
    });

    effect(() => {
      const currentMode = this.mode();
      const id = this.strategyId();
      const version = this.selectedVersionNumber();

      if (currentMode === 'list') {
        this.store.loadStrategies({ includeArchived: this.includeArchived() });
        return;
      }

      if ((currentMode === 'detail' || currentMode === 'edit') && id) {
        this.store.loadStrategyDetail({ id, version: version ?? undefined });
      }
    });

    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        this.mode.set((data['strategyMode'] as StrategyMode) ?? 'list');
      });

    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.strategyId.set(params.get('id'));
      });

    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const raw = params.get('version');
        const parsed = raw ? Number(raw) : null;
        this.selectedVersionNumber.set(
          parsed && Number.isFinite(parsed) ? parsed : null,
        );
      });
  }

  onCreateStrategy(): void {
    void this.router.navigateByUrl('/strategies/new');
  }

  onIncludeArchivedChange(value: boolean): void {
    this.includeArchived.set(value);
    this.store.loadStrategies({ includeArchived: value });
  }

  onViewStrategy(id: string): void {
    void this.router.navigate(['/strategies', id]);
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

  onSave(payload: CreateStrategyRequest | CreateStrategyVersionRequest): void {
    if (this.isNewMode()) {
      this.store.createStrategy(payload as CreateStrategyRequest);
      return;
    }

    const id = this.strategyId();
    if (!id) {
      return;
    }

    this.store.createStrategyVersion({
      id,
      payload: payload as CreateStrategyVersionRequest,
    });

    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'New version created',
      life: 2500,
    });

    void this.router.navigate(['/strategies', id]);
  }

  onSelectVersion(item: StrategyVersionHistoryItem): void {
    const id = this.strategyId();
    if (!id) {
      return;
    }

    void this.router.navigate(['/strategies', id], {
      queryParams: { version: item.versionNumber },
    });
  }

  onEditNewVersion(): void {
    const id = this.strategyId();
    if (!id) {
      return;
    }

    void this.router.navigate(['/strategies', id, 'edit']);
  }

  onBackToList(): void {
    void this.router.navigateByUrl('/strategies');
  }

  onCancelForm(): void {
    const id = this.strategyId();
    if (id) {
      void this.router.navigate(['/strategies', id]);
      return;
    }

    void this.router.navigateByUrl('/strategies');
  }
}
