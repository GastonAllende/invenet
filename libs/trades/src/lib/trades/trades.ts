import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { TradesStore } from '../../data-access/src/lib/store/trades.store';

@Component({
  selector: 'lib-trades',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    CardModule,
    MessageModule,
  ],
  templateUrl: './trades.html',
  styleUrl: './trades.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Trades implements OnInit {
  protected readonly store = inject(TradesStore);

  readonly trades = this.store.entities;
  readonly loading = this.store.isLoading;
  readonly error = this.store.error;

  ngOnInit(): void {
    this.store.loadTrades();
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
