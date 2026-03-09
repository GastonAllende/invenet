import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { AccountsStore } from '@invenet/account-data-access';
import { TradesStore } from '@invenet/trade-data-access';
import { TradeDetailComponent } from '@invenet/trade-ui';

@Component({
  selector: 'lib-trade-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    ConfirmDialogModule,
    TradeDetailComponent,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="trade-shell entity-shell">
      <p-toast></p-toast>
      <p-confirmDialog></p-confirmDialog>
      <lib-trade-detail
        [trade]="selectedTradeDetail()"
        [accounts]="accounts()"
        (edit)="onEdit()"
        (archive)="onArchive()"
        (unarchive)="onUnarchive()"
        (back)="onBack()"
      ></lib-trade-detail>
    </div>
  `,
})
export class TradeDetailPage {
  private readonly store = inject(TradesStore);
  private readonly accountsStore = inject(AccountsStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  private readonly tradeId = this.route.snapshot.paramMap.get('id');

  selectedTradeDetail = this.store.selectedTradeDetail;
  accounts = this.accountsStore.activeAccounts;

  constructor() {
    this.accountsStore.loadAccounts({ includeArchived: false });

    if (this.tradeId) {
      this.store.loadTradeDetail(this.tradeId);
    }
  }

  onEdit(): void {
    if (this.tradeId) {
      void this.router.navigateByUrl(`/journal/${this.tradeId}/edit`);
    }
  }

  onArchive(): void {
    if (!this.tradeId) return;
    const id = this.tradeId;
    this.confirmationService.confirm({
      message: 'Archive this trade? It will be hidden from default views.',
      header: 'Archive Trade',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.store.archiveTrade(id);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Trade archived',
          life: 3000,
        });
      },
    });
  }

  onUnarchive(): void {
    if (!this.tradeId) return;
    this.store.unarchiveTrade(this.tradeId);
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Trade unarchived',
      life: 3000,
    });
  }

  onBack(): void {
    void this.router.navigateByUrl('/journal');
  }
}
