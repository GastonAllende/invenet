import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { AccountsStore, ActiveAccountStore } from '@invenet/accounts';
import { StrategiesApiService, StrategiesStore } from '@invenet/strategies';
import { TradesApiService } from '../../../data-access/src/lib/services/trades-api.service';
import { TradesStore } from '../../../data-access/src/lib/store/trades.store';
import { QuickTradeService } from '../../services/quick-trade.service';

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
  styleUrl: './quick-trade-modal.component.css',
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

  readonly isOpen = this.tradesStore.isQuickModalOpen;
  readonly isLoading = this.tradesStore.isLoading;
  readonly accounts = computed(() => this.accountsStore.activeAccounts());
  readonly strategies = computed(() => this.strategiesStore.activeStrategies());

  readonly form = this.fb.group({
    accountId: ['', Validators.required],
    symbol: ['', [Validators.required, Validators.maxLength(20)]],
    direction: this.fb.control<'Long' | 'Short'>('Long', Validators.required),
    strategyId: ['', Validators.required],
    entryPrice: [null as number | null, [Validators.required, Validators.min(0.0001)]],
    quantity: [null as number | null],
  });

  readonly currentVersionNumber = signal<number | null>(null);
  readonly currentVersionId = signal<string | null>(null);
  readonly strategyVersionError = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (!this.isOpen()) {
        return;
      }

      const preferred = this.quickTradeService.preferredAccountId();
      const activeAccountId = this.activeAccountStore.activeAccountId();
      this.form.patchValue({ accountId: preferred ?? activeAccountId ?? '' });
    });

    effect(() => {
      if (this.strategies().length === 0) {
        this.strategiesStore.loadStrategies({ includeArchived: false });
      }
    });
  }

  onStrategyChange(strategyId: string | null): void {
    this.currentVersionId.set(null);
    this.currentVersionNumber.set(null);
    this.strategyVersionError.set(null);

    if (!strategyId) {
      return;
    }

    this.strategiesApiService.get(strategyId).subscribe({
      next: (strategy) => {
        const version = strategy.currentVersion;
        if (!version) {
          this.strategyVersionError.set('This strategy has no published version');
          return;
        }
        this.currentVersionId.set(version.id);
        this.currentVersionNumber.set(version.versionNumber);
      },
      error: () => {
        this.strategyVersionError.set('Failed to resolve strategy version');
      },
    });
  }

  submitQuickTrade(): void {
    if (this.form.invalid || !this.currentVersionId()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.tradesApiService.create({
      accountId: value.accountId ?? '',
      strategyVersionId: this.currentVersionId() ?? undefined,
      symbol: value.symbol?.trim().toUpperCase() ?? '',
      direction: value.direction ?? 'Long',
      entryPrice: value.entryPrice ?? 0,
      openedAt: new Date().toISOString(),
      quantity: value.quantity ?? undefined,
      status: 'Open',
    }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Trade logged',
          life: 3000,
        });

        const accountId = value.accountId ?? '';
        if (accountId) {
          this.tradesStore.loadTrades({ accountId });
        }
        this.close();
      },
      error: (error: Error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to log trade',
          life: 5000,
        });
      },
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
    this.currentVersionId.set(null);
    this.currentVersionNumber.set(null);
    this.strategyVersionError.set(null);
  }
}
