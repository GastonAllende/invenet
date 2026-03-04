import { Component, effect, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AccountsStore, ActiveAccountStore } from '@invenet/accounts';
import { StrategiesStore } from '@invenet/strategy-data-access';
import {
  CreateTradeRequest,
  TradesStore,
  UpdateTradeRequest,
} from '@invenet/trade-data-access';
import { TradeFormComponent } from '@invenet/trade-ui';

@Component({
  selector: 'lib-trade-edit-page',
  standalone: true,
  imports: [CommonModule, ToastModule, TradeFormComponent],
  providers: [MessageService],
  template: `
    <div class="trade-shell entity-shell">
      <p-toast></p-toast>
      <section class="page-header entity-header">
        <h1 class="page-title entity-title">Edit Trade</h1>
        <p class="page-subtitle entity-subtitle">
          Update execution and journal details for this trade.
        </p>
      </section>
      <lib-trade-form
        mode="edit"
        [trade]="selectedTradeDetail()"
        [accounts]="accounts()"
        [defaultAccountId]="activeAccountId()"
        [strategies]="strategies()"
        [isLoading]="isLoading()"
        (save)="onSaveTrade($event)"
        (formCancel)="onCancel()"
      ></lib-trade-form>
    </div>
  `,
})
export class TradeEditPage {
  private readonly store = inject(TradesStore);
  private readonly accountsStore = inject(AccountsStore);
  private readonly activeAccountStore = inject(ActiveAccountStore);
  private readonly strategiesStore = inject(StrategiesStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  private readonly tradeId = this.route.snapshot.paramMap.get('id');

  selectedTradeDetail = this.store.selectedTradeDetail;
  accounts = this.accountsStore.activeAccounts;
  activeAccountId = this.activeAccountStore.activeAccountId;
  strategies = this.strategiesStore.activeStrategies;
  isLoading = this.store.isLoading;
  error = this.store.error;

  constructor() {
    this.accountsStore.loadAccounts({ includeArchived: false });
    this.strategiesStore.loadStrategies({ includeArchived: false });

    if (this.tradeId) {
      this.store.loadTradeDetail(this.tradeId);
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

  onSaveTrade(payload: CreateTradeRequest | UpdateTradeRequest): void {
    if (!this.tradeId) return;
    this.store.updateTrade({
      id: this.tradeId,
      request: payload as UpdateTradeRequest,
    });
    void this.router.navigateByUrl(`/journal/${this.tradeId}`);
  }

  onCancel(): void {
    if (this.tradeId) {
      void this.router.navigateByUrl(`/journal/${this.tradeId}`);
      return;
    }
    void this.router.navigateByUrl('/journal');
  }
}
