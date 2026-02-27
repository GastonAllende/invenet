import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import type {
  Trade,
  TradeFilters,
} from '../../../data-access/src/lib/models/trade.model';

@Component({
  selector: 'lib-trade-list',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    DatePickerModule,
    SelectModule,
    CheckboxModule,
  ],
  templateUrl: './trade-list.component.html',
  styleUrl: './trade-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradeListComponent {
  trades = input<Trade[]>([]);
  isLoading = input<boolean>(false);
  includeArchived = input<boolean>(false);
  accounts = input<Array<{ id: string; name: string }>>([]);
  strategies = input<Array<{ id: string; name: string }>>([]);
  selectedAccountId = input<string | null>(null);

  includeArchivedChange = output<boolean>();
  filtersChange = output<Omit<TradeFilters, 'accountId'>>();
  logFull = output<void>();
  quickLog = output<void>();
  view = output<string>();
  archive = output<string>();
  unarchive = output<string>();

  protected statusOptions = [
    { label: 'All', value: null },
    { label: 'Open', value: 'Open' },
    { label: 'Closed', value: 'Closed' },
  ];

  protected selectedStrategyId: string | null = null;
  protected selectedStatus: 'Open' | 'Closed' | null = null;
  protected selectedRange: Date[] | null = null;

  onToggleArchived(value: boolean): void {
    this.includeArchivedChange.emit(value);
  }

  onFilterChange(): void {
    const dateFrom = this.selectedRange?.[0]?.toISOString();
    const dateTo = this.selectedRange?.[1]?.toISOString();
    this.filtersChange.emit({
      strategyId: this.selectedStrategyId ?? undefined,
      status: this.selectedStatus ?? undefined,
      dateFrom,
      dateTo,
    });
  }

  onLogFull(): void {
    this.logFull.emit();
  }

  onQuickLog(): void {
    this.quickLog.emit();
  }

  onView(tradeId: string): void {
    this.view.emit(tradeId);
  }

  onArchive(tradeId: string): void {
    this.archive.emit(tradeId);
  }

  onUnarchive(tradeId: string): void {
    this.unarchive.emit(tradeId);
  }

  getAccountName(accountId: string): string {
    return (
      this.accounts().find((account) => account.id === accountId)?.name ??
      accountId
    );
  }

  getStatusSeverity(
    status: string,
  ): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    return status === 'Closed' ? 'success' : 'info';
  }

  getDirectionSeverity(direction: string): 'success' | 'danger' {
    return direction === 'Long' ? 'success' : 'danger';
  }
}
