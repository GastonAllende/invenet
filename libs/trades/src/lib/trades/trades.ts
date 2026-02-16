import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';

export interface Trade {
  id: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total: number;
  date: Date;
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
}

@Component({
  selector: 'lib-trades',
  imports: [CommonModule, TableModule, ButtonModule, TagModule, CardModule],
  templateUrl: './trades.html',
  styleUrl: './trades.css',
})
export class Trades implements OnInit {
  trades = signal<Trade[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.loadTrades();
  }

  loadTrades(): void {
    this.loading.set(true);

    // Simulating API call with sample data
    setTimeout(() => {
      const sampleTrades: Trade[] = [
        {
          id: 1,
          symbol: 'AAPL',
          type: 'BUY',
          quantity: 100,
          price: 175.5,
          total: 17550.0,
          date: new Date('2024-02-15T10:30:00'),
          status: 'COMPLETED',
        },
        {
          id: 2,
          symbol: 'GOOGL',
          type: 'SELL',
          quantity: 50,
          price: 142.3,
          total: 7115.0,
          date: new Date('2024-02-15T11:45:00'),
          status: 'COMPLETED',
        },
        {
          id: 3,
          symbol: 'MSFT',
          type: 'BUY',
          quantity: 75,
          price: 420.15,
          total: 31511.25,
          date: new Date('2024-02-15T14:20:00'),
          status: 'PENDING',
        },
        {
          id: 4,
          symbol: 'TSLA',
          type: 'BUY',
          quantity: 30,
          price: 195.75,
          total: 5872.5,
          date: new Date('2024-02-14T09:15:00'),
          status: 'COMPLETED',
        },
        {
          id: 5,
          symbol: 'AMZN',
          type: 'SELL',
          quantity: 25,
          price: 178.9,
          total: 4472.5,
          date: new Date('2024-02-14T15:30:00'),
          status: 'COMPLETED',
        },
        {
          id: 6,
          symbol: 'NVDA',
          type: 'BUY',
          quantity: 40,
          price: 722.48,
          total: 28899.2,
          date: new Date('2024-02-13T10:00:00'),
          status: 'COMPLETED',
        },
        {
          id: 7,
          symbol: 'META',
          type: 'SELL',
          quantity: 60,
          price: 490.25,
          total: 29415.0,
          date: new Date('2024-02-13T13:45:00'),
          status: 'CANCELLED',
        },
        {
          id: 8,
          symbol: 'AMD',
          type: 'BUY',
          quantity: 150,
          price: 185.6,
          total: 27840.0,
          date: new Date('2024-02-12T11:20:00'),
          status: 'COMPLETED',
        },
        {
          id: 9,
          symbol: 'NFLX',
          type: 'BUY',
          quantity: 20,
          price: 598.75,
          total: 11975.0,
          date: new Date('2024-02-12T16:10:00'),
          status: 'COMPLETED',
        },
        {
          id: 10,
          symbol: 'INTC',
          type: 'SELL',
          quantity: 200,
          price: 43.25,
          total: 8650.0,
          date: new Date('2024-02-11T10:30:00'),
          status: 'COMPLETED',
        },
        {
          id: 11,
          symbol: 'BA',
          type: 'BUY',
          quantity: 35,
          price: 205.8,
          total: 7203.0,
          date: new Date('2024-02-11T14:00:00'),
          status: 'PENDING',
        },
        {
          id: 12,
          symbol: 'DIS',
          type: 'SELL',
          quantity: 80,
          price: 112.5,
          total: 9000.0,
          date: new Date('2024-02-10T09:45:00'),
          status: 'COMPLETED',
        },
      ];

      this.trades.set(sampleTrades);
      this.loading.set(false);
    }, 500);
  }

  getStatusSeverity(
    status: string,
  ): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'PENDING':
        return 'warn';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'info';
    }
  }

  getTypeSeverity(type: string): 'success' | 'danger' {
    return type === 'BUY' ? 'success' : 'danger';
  }
}
