import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import {
  AccountsStore,
  ActiveAccountStore,
} from '@invenet/account-data-access';
import {
  StrategiesApiService,
  StrategiesStore,
} from '@invenet/strategy-data-access';
import {
  TradesApiService,
  TradesStore,
  QuickTradeService,
} from '@invenet/trade-data-access';

@Component({
  selector: 'lib-quick-trade-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './quick-trade-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickTradeModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly tradesStore = inject(TradesStore);
  private readonly quickTradeService = inject(QuickTradeService);
  private readonly activeAccountStore = inject(ActiveAccountStore);
  private readonly accountsStore = inject(AccountsStore);
  private readonly strategiesStore = inject(StrategiesStore);
  private readonly strategiesApiService = inject(StrategiesApiService);
  private readonly tradesApiService = inject(TradesApiService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isOpen = this.tradesStore.isQuickModalOpen;
  readonly isLoading = this.tradesStore.isLoading;
  readonly accounts = computed(() => this.accountsStore.activeAccounts());
  readonly strategies = computed(() => this.strategiesStore.activeStrategies());

  readonly form = this.fb.group({
    accountId: ['', Validators.required],
    symbol: ['', [Validators.required, Validators.maxLength(20)]],
    direction: this.fb.control<'Long' | 'Short'>('Long', Validators.required),
    strategyId: ['', Validators.required],
    entryPrice: [
      null as number | null,
      [Validators.required, Validators.min(0.0001)],
    ],
    quantity: [null as number | null],
  });

  readonly selectedStrategyId = signal<string | null>(null);

  private readonly strategyResource = rxResource({
    params: () => this.selectedStrategyId() || undefined,
    stream: ({ params: strategyId }: { params: string }) =>
      this.strategiesApiService.get(strategyId),
  });

  readonly currentVersionId = computed(() => {
    const strategy = this.strategyResource.value();
    return strategy?.currentVersion?.id ?? null;
  });

  readonly currentVersionNumber = computed(() => {
    const strategy = this.strategyResource.value();
    return strategy?.currentVersion?.versionNumber ?? null;
  });

  readonly strategyVersionError = computed(() => {
    if (this.strategyResource.error()) {
      return 'Failed to resolve strategy version';
    }
    const strategy = this.strategyResource.value();
    if (strategy && !strategy.currentVersion) {
      return 'This strategy has no published version';
    }
    return null;
  });

  constructor() {
    effect(() => {
      if (!this.isOpen()) {
        return;
      }

      const preferred = this.quickTradeService.preferredAccountId();
      const activeAccountId = this.activeAccountStore.activeAccountId();
      this.form.patchValue({ accountId: preferred ?? activeAccountId ?? '' });
    });

    if (this.strategies().length === 0) {
      this.strategiesStore.loadStrategies({ includeArchived: false });
    }
  }

  onStrategyChange(strategyId: string | null): void {
    this.selectedStrategyId.set(strategyId);
  }

  submitQuickTrade(): void {
    if (this.form.invalid || !this.currentVersionId()) {
      this.form.markAllAsTouched();
      return;
    }
    this.executeQuickTrade();
  }

  private buildTradePayload() {
    const value = this.form.getRawValue();
    return {
      accountId: value.accountId ?? '',
      strategyVersionId: this.currentVersionId() ?? undefined,
      symbol: value.symbol?.trim().toUpperCase() ?? '',
      direction: value.direction ?? 'Long',
      entryPrice: value.entryPrice ?? 0,
      openedAt: new Date().toISOString(),
      quantity: value.quantity ?? undefined,
      status: 'Open' as const,
    };
  }

  private executeQuickTrade(): void {
    const payload = this.buildTradePayload();
    this.tradesApiService
      .create(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.onTradeSuccess(payload.accountId),
        error: (error: Error) => this.onTradeError(error),
      });
  }

  private onTradeSuccess(accountId: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Trade logged',
      life: 3000,
    });
    if (accountId) {
      this.tradesStore.loadTrades({ accountId });
    }
    this.close();
  }

  private onTradeError(error: Error): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to log trade',
      life: 5000,
    });
  }

  close(): void {
    this.quickTradeService.close();
    this.form.reset({
      accountId: '',
      symbol: '',
      direction: 'Long',
      strategyId: '',
      entryPrice: null,
      quantity: null,
    });
    this.selectedStrategyId.set(null);
  }
}
