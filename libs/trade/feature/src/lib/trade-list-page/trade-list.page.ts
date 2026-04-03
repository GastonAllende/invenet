import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import {
  AccountsStore,
  ActiveAccountStore,
} from '@invenet/account-data-access';
import { StrategiesStore } from '@invenet/strategy-data-access';
import {
  TradeFilters,
  TradesStore,
  QuickTradeService,
} from '@invenet/trade-data-access';
import { TradeListComponent } from '@invenet/trade-ui';

@Component({
  selector: 'lib-trade-list-page',
  standalone: true,
  imports: [CommonModule, ToastModule, ConfirmDialogModule, TradeListComponent],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="flex flex-col gap-5">
      <p-toast></p-toast>
      <p-confirmDialog></p-confirmDialog>
      <lib-trade-list
        [trades]="trades()"
        [isLoading]="isLoading()"
        [accounts]="accounts()"
        [strategies]="strategies()"
        [selectedAccountId]="activeAccountId()"
        [includeArchived]="includeArchived()"
        (filtersChange)="onFiltersChange($event)"
        (includeArchivedChange)="onIncludeArchivedChange($event)"
        (logFull)="onLogFull()"
        (quickLog)="onQuickLog()"
        (view)="onView($event)"
        (edit)="onEdit($event)"
        (archive)="onArchive($event)"
        (unarchive)="onUnarchive($event)"
      ></lib-trade-list>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradeListPage {
  private readonly store = inject(TradesStore);
  private readonly accountsStore = inject(AccountsStore);
  private readonly activeAccountStore = inject(ActiveAccountStore);
  private readonly strategiesStore = inject(StrategiesStore);
  private readonly quickTradeService = inject(QuickTradeService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  trades = this.store.entities;
  isLoading = this.store.isLoading;
  error = this.store.error;
  accounts = this.accountsStore.activeAccounts;
  activeAccountId = this.activeAccountStore.activeAccountId;
  strategies = this.strategiesStore.activeStrategies;
  includeArchived = signal(false);
  filters = signal<Omit<TradeFilters, 'accountId'>>({});

  constructor() {
    this.accountsStore.loadAccounts({ includeArchived: false });
    this.strategiesStore.loadStrategies({ includeArchived: false });

    effect(() => {
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

  onEdit(tradeId: string): void {
    void this.router.navigateByUrl(`/journal/${tradeId}/edit`);
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
}
