import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';

interface Trade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  total: number;
  date: Date;
  status: 'completed' | 'pending' | 'cancelled';
}

@Component({
  selector: 'app-trades',
  templateUrl: './trades.html',
  styleUrl: './trades.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
  ],
})
export class Trades {
  protected readonly tradeSummary = signal([
    { label: 'Total Trades', value: '142', icon: 'trending_up', color: '#4caf50' },
    { label: 'Total Volume', value: '$125,430', icon: 'attach_money', color: '#2196f3' },
    { label: 'Active Positions', value: '8', icon: 'account_balance', color: '#ff9800' },
    { label: 'P&L Today', value: '+$2,340', icon: 'analytics', color: '#4caf50' },
  ]);

  protected readonly trades = signal<Trade[]>([
    {
      id: 'TRD001',
      symbol: 'AAPL',
      type: 'buy',
      quantity: 100,
      price: 150.25,
      total: 15025,
      date: new Date('2024-09-12T10:30:00'),
      status: 'completed',
    },
    {
      id: 'TRD002',
      symbol: 'GOOGL',
      type: 'sell',
      quantity: 50,
      price: 2750.8,
      total: 137540,
      date: new Date('2024-09-12T11:15:00'),
      status: 'completed',
    },
    {
      id: 'TRD003',
      symbol: 'TSLA',
      type: 'buy',
      quantity: 75,
      price: 245.3,
      total: 18397.5,
      date: new Date('2024-09-12T14:20:00'),
      status: 'pending',
    },
    {
      id: 'TRD004',
      symbol: 'MSFT',
      type: 'buy',
      quantity: 200,
      price: 310.45,
      total: 62090,
      date: new Date('2024-09-12T09:45:00'),
      status: 'completed',
    },
    {
      id: 'TRD005',
      symbol: 'NVDA',
      type: 'sell',
      quantity: 25,
      price: 875.34,
      total: 21883.5,
      date: new Date('2024-09-11T16:30:00'),
      status: 'completed',
    },
  ]);

  displayedColumns: string[] = [
    'id',
    'symbol',
    'type',
    'quantity',
    'price',
    'total',
    'date',
    'status',
    'actions',
  ];

  addNewTrade(): void {
    console.log('Add new trade');
    // In a real app, this would open a dialog or navigate to a trade form
  }

  refreshTrades(): void {
    console.log('Refresh trades');
    // In a real app, this would fetch the latest trade data from an API
  }

  viewTrade(trade: Trade): void {
    console.log('View trade:', trade);
    // In a real app, this would show trade details in a dialog or new page
  }

  editTrade(trade: Trade): void {
    console.log('Edit trade:', trade);
    // In a real app, this would open an edit form for the trade
  }

  cancelTrade(trade: Trade): void {
    console.log('Cancel trade:', trade);
    // In a real app, this would send a cancel request to the API
    this.trades.update((trades) =>
      trades.map((t) => (t.id === trade.id ? { ...t, status: 'cancelled' as const } : t))
    );
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed':
        return '#4caf50';
      case 'pending':
        return '#ff9800';
      case 'cancelled':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  }
}
