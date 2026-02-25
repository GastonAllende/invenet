import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AccountsStore, ActiveAccountStore } from '@invenet/accounts';
import { StrategiesStore } from '@invenet/strategies';
import { TradesStore } from '../../../data-access/src/lib/store/trades.store';
import { TradeListComponent } from '../../ui/trade-list/trade-list.component';
import { TradeFormComponent } from '../../ui/trade-form/trade-form.component';
import type { Trade } from '../../../data-access/src/lib/models/trade.model';
import type {
  CreateTradeRequest,
  UpdateTradeRequest,
} from '../../../data-access/src';

@Component({
  selector: 'lib-trade-shell',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    TradeListComponent,
    TradeFormComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './trade-shell.component.html',
  styleUrl: './trade-shell.component.css',
})
export class TradeShellComponent implements OnInit {
  private readonly store = inject(TradesStore);
  private readonly accountsStore = inject(AccountsStore);
  private readonly activeAccountStore = inject(ActiveAccountStore);
  private readonly strategiesStore = inject(StrategiesStore);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  // Store signals
  trades = this.store.entities;
  isLoading = this.store.isLoading;
  error = this.store.error;
  accounts = this.accountsStore.activeAccounts;
  activeAccountId = this.activeAccountStore.activeAccountId;
  strategies = this.strategiesStore.activeStrategies;

  // Local UI state
  showFormDialog = signal(false);
  selectedTrade = signal<Trade | null>(null);

  constructor() {
    effect(() => {
      const accounts = this.accounts();
      const activeAccountId = this.activeAccountId();

      if (!activeAccountId) {
        if (accounts.length > 0) {
          this.activeAccountStore.setActiveAccount(accounts[0].id);
        } else {
          this.store.clearTrades();
        }
        return;
      }

      this.store.loadTrades(activeAccountId);
    });

    effect(() => {
      const error = this.error();
      if (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error,
          life: 5000,
        });
        this.store.clearError();
      }
    });
  }

  ngOnInit(): void {
    this.accountsStore.loadAccounts({ includeArchived: false });
    this.strategiesStore.loadStrategies({ includeDeleted: false });
  }

  onCreateTrade(): void {
    this.selectedTrade.set(null);
    this.showFormDialog.set(true);
  }

  onEditTrade(trade: Trade): void {
    this.selectedTrade.set(trade);
    this.showFormDialog.set(true);
  }

  onDeleteTrade(tradeId: string): void {
    this.confirmationService.confirm({
      message:
        'Are you sure you want to delete this trade? This action cannot be undone.',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.deleteTrade(tradeId);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Trade deleted successfully',
          life: 3000,
        });
      },
    });
  }

  onSaveTrade(payload: CreateTradeRequest | UpdateTradeRequest): void {
    const selected = this.selectedTrade();

    if (selected) {
      this.store.updateTrade({
        id: selected.id,
        request: payload as UpdateTradeRequest,
      });
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Trade updated successfully',
        life: 3000,
      });
    } else {
      this.store.createTrade(payload as CreateTradeRequest);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Trade created successfully',
        life: 3000,
      });
    }

    this.closeFormDialog();
  }

  onCancelForm(): void {
    this.closeFormDialog();
  }

  private closeFormDialog(): void {
    this.showFormDialog.set(false);
    this.selectedTrade.set(null);
  }
}
