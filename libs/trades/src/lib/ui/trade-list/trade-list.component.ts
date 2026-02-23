import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import type { Trade } from '../../../data-access/src/lib/models/trade.model';

@Component({
  selector: 'lib-trade-list',
  imports: [CommonModule, TableModule, ButtonModule, TagModule, TooltipModule],
  templateUrl: './trade-list.component.html',
  styleUrl: './trade-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradeListComponent {
  // Inputs
  trades = input<Trade[]>([]);
  isLoading = input<boolean>(false);

  // Outputs
  create = output<void>();
  edit = output<Trade>();
  delete = output<string>();

  onCreate(): void {
    this.create.emit();
  }

  onEdit(trade: Trade): void {
    this.edit.emit(trade);
  }

  onDelete(tradeId: string): void {
    this.delete.emit(tradeId);
  }

  getStatusSeverity(
    status: string,
  ): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    switch (status) {
      case 'Win':
        return 'success';
      case 'Loss':
        return 'danger';
      case 'Open':
        return 'info';
      default:
        return 'secondary';
    }
  }

  getTypeSeverity(type: string): 'success' | 'danger' {
    return type === 'BUY' ? 'success' : 'danger';
  }
}
