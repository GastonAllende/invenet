import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import {
  AccountsStore,
  ActiveAccountStore,
} from '@invenet/account-data-access';
import { StrategiesStore } from '@invenet/strategy-data-access';
import {
  CreateTradeRequest,
  UpdateTradeRequest,
  TradesStore,
} from '@invenet/trade-data-access';
import { TradeFormComponent } from '@invenet/trade-ui';

@Component({
  selector: 'lib-trade-new-page',
  standalone: true,
  imports: [CommonModule, ToastModule, TradeFormComponent],
  providers: [MessageService],
  template: `
    <div class="flex flex-col gap-5">
      <p-toast></p-toast>
      <section class="bg-surface-card border border-surface-border rounded p-6">
        <h1 class="text-3xl font-semibold m-0 text-color">Log Trade</h1>
        <p class="m-0 text-muted-color">
          Capture complete trade context for later review.
        </p>
      </section>
      <lib-trade-form
        mode="create"
        [accounts]="accounts()"
        [defaultAccountId]="activeAccountId()"
        [strategies]="strategies()"
        [isLoading]="isLoading()"
        (save)="onSaveTrade($event)"
        (formCancel)="onCancel()"
      ></lib-trade-form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradeNewPage {
  private readonly store = inject(TradesStore);
  private readonly accountsStore = inject(AccountsStore);
  private readonly activeAccountStore = inject(ActiveAccountStore);
  private readonly strategiesStore = inject(StrategiesStore);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  accounts = this.accountsStore.activeAccounts;
  activeAccountId = this.activeAccountStore.activeAccountId;
  strategies = this.strategiesStore.activeStrategies;
  isLoading = this.store.isLoading;
  error = this.store.error;

  constructor() {
    effect(() => {
      const savedId = this.store.lastSavedId();
      if (!savedId) return;
      void this.router.navigateByUrl(`/journal/${savedId}`);
      this.store.clearLastSaved();
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

  onSaveTrade(payload: CreateTradeRequest | UpdateTradeRequest): void {
    this.store.createTrade(payload as CreateTradeRequest);
  }

  onCancel(): void {
    void this.router.navigateByUrl('/journal');
  }
}
