import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, effect, inject, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { AccountsStore, ActiveAccountStore } from '@invenet/accounts';
import { StrategiesStore } from '@invenet/strategies';
import {
  CreateTradeRequest,
  TradeFilters,
  TradesStore,
  UpdateTradeRequest,
} from '../../../data-access/src';
import { QuickTradeService } from '../../services/quick-trade.service';
import { TradeDetailComponent } from '../../ui/trade-detail/trade-detail.component';
import { TradeFormComponent } from '../../ui/trade-form/trade-form.component';
import { TradeListComponent } from '../../ui/trade-list/trade-list.component';

type JournalMode = 'list' | 'new' | 'detail' | 'edit';

@Component({
  selector: 'lib-trade-shell',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    ConfirmDialogModule,
    TradeListComponent,
    TradeFormComponent,
    TradeDetailComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './trade-shell.component.html',
  styleUrl: './trade-shell.component.css',
})
export class TradeShellComponent {
  private readonly store = inject(TradesStore);
  private readonly accountsStore = inject(AccountsStore);
  private readonly activeAccountStore = inject(ActiveAccountStore);
  private readonly strategiesStore = inject(StrategiesStore);
  private readonly quickTradeService = inject(QuickTradeService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  trades = this.store.entities;
  selectedTradeDetail = this.store.selectedTradeDetail;
  isLoading = this.store.isLoading;
  error = this.store.error;
  accounts = this.accountsStore.activeAccounts;
  activeAccountId = this.activeAccountStore.activeAccountId;
  strategies = this.strategiesStore.activeStrategies;
  includeArchived = signal(false);
  filters = signal<Omit<TradeFilters, 'accountId'>>({});
  journalMode = signal<JournalMode>('list');
  tradeId = signal<string | null>(null);

  constructor() {
    this.accountsStore.loadAccounts({ includeArchived: false });
    this.strategiesStore.loadStrategies({ includeArchived: false });

    effect(() => {
      const mode =
        (this.route.snapshot.data['journalMode'] as JournalMode | undefined) ??
        'list';
      const tradeId = this.route.snapshot.paramMap.get('id');
      this.journalMode.set(mode);
      this.tradeId.set(tradeId);
    });

    effect(() => {
      if (this.journalMode() !== 'list') {
        return;
      }

      const activeAccountId = this.activeAccountId();
      if (!activeAccountId) {
        this.store.clearTrades();
        return;
      }

      this.store.loadTrades({
        accountId: activeAccountId,
        includeArchived: this.includeArchived(),
        ...this.filters(),
      });
    });

    effect(() => {
      const tradeId = this.tradeId();
      const mode = this.journalMode();
      if (!tradeId || (mode !== 'detail' && mode !== 'edit')) {
        return;
      }

      this.store.loadTradeDetail(tradeId);
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
      const savedId = this.store.lastSavedId();
      if (!savedId) {
        return;
      }

      void this.router.navigateByUrl(`/journal/${savedId}`);
      this.store.clearLastSaved();
    });
  }

  onFiltersChange(filters: Omit<TradeFilters, 'accountId'>): void {
    this.filters.set(filters);
  }

  onIncludeArchivedChange(value: boolean): void {
    this.includeArchived.set(value);
  }

  onLogFull(): void {
    void this.router.navigateByUrl('/journal/new');
  }

  onQuickLog(): void {
    this.quickTradeService.open(this.activeAccountId() ?? undefined);
  }

  onView(tradeId: string): void {
    void this.router.navigateByUrl(`/journal/${tradeId}`);
  }

  onArchive(tradeId: string): void {
    this.confirmationService.confirm({
      message: 'Archive this trade? It will be hidden from default views.',
      header: 'Archive Trade',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.store.archiveTrade(tradeId);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Trade archived',
          life: 3000,
        });
      },
    });
  }

  onUnarchive(tradeId: string): void {
    this.store.unarchiveTrade(tradeId);
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Trade unarchived',
      life: 3000,
    });
  }

  onSaveTrade(payload: CreateTradeRequest | UpdateTradeRequest): void {
    if (this.journalMode() === 'edit' && this.tradeId()) {
      this.store.updateTrade({
        id: this.tradeId()!,
        request: payload as UpdateTradeRequest,
      });
      return;
    }

    this.store.createTrade(payload as CreateTradeRequest);
  }

  onCancelForm(): void {
    if (this.tradeId()) {
      void this.router.navigateByUrl(`/journal/${this.tradeId()}`);
      return;
    }
    void this.router.navigateByUrl('/journal');
  }

  onEditFromDetail(): void {
    if (this.tradeId()) {
      void this.router.navigateByUrl(`/journal/${this.tradeId()}/edit`);
    }
  }

  onArchiveFromDetail(): void {
    if (this.tradeId()) {
      this.onArchive(this.tradeId()!);
    }
  }

  onUnarchiveFromDetail(): void {
    if (this.tradeId()) {
      this.onUnarchive(this.tradeId()!);
    }
  }

  onBackToJournal(): void {
    void this.router.navigateByUrl('/journal');
  }
}
