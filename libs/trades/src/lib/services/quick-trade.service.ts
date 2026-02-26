import { Injectable, inject, signal } from '@angular/core';
import { TradesStore } from '../../data-access/src';

@Injectable({ providedIn: 'root' })
export class QuickTradeService {
  private readonly tradesStore = inject(TradesStore);
  private readonly preferredAccountIdSignal = signal<string | null>(null);

  preferredAccountId = this.preferredAccountIdSignal.asReadonly();

  open(accountId?: string): void {
    this.preferredAccountIdSignal.set(accountId ?? null);
    this.tradesStore.openQuickModal();
  }

  close(): void {
    this.tradesStore.closeQuickModal();
    this.preferredAccountIdSignal.set(null);
  }
}
