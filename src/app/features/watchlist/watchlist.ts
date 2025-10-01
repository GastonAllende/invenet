import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

interface WatchlistSymbol {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
  sector: string;
  addedDate: Date;
}

@Component({
  selector: 'app-watchlist',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatTableModule,
    MatTooltipModule,
    MatBadgeModule,
  ],
  templateUrl: './watchlist.html',
  styleUrl: './watchlist.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Watchlist {
  protected readonly searchQuery = signal('');
  protected newSymbol = '';

  protected readonly symbols = signal<WatchlistSymbol[]>([
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 174.21,
      change: 2.45,
      changePercent: 1.43,
      volume: 45678900,
      marketCap: '2.7T',
      sector: 'Technology',
      addedDate: new Date('2024-01-15'),
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      price: 138.32,
      change: -1.87,
      changePercent: -1.33,
      volume: 28934500,
      marketCap: '1.7T',
      sector: 'Technology',
      addedDate: new Date('2024-02-01'),
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      price: 415.89,
      change: 5.23,
      changePercent: 1.27,
      volume: 34567890,
      marketCap: '3.1T',
      sector: 'Technology',
      addedDate: new Date('2024-01-20'),
    },
    {
      symbol: 'TSLA',
      name: 'Tesla, Inc.',
      price: 248.42,
      change: -12.34,
      changePercent: -4.74,
      volume: 67890123,
      marketCap: '789.5B',
      sector: 'Automotive',
      addedDate: new Date('2024-02-10'),
    },
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      price: 875.34,
      change: 18.76,
      changePercent: 2.19,
      volume: 56789012,
      marketCap: '2.2T',
      sector: 'Technology',
      addedDate: new Date('2024-01-25'),
    },
  ]);

  protected readonly filteredSymbols = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.symbols();

    return this.symbols().filter(
      symbol =>
        symbol.symbol.toLowerCase().includes(query) ||
        symbol.name.toLowerCase().includes(query) ||
        symbol.sector.toLowerCase().includes(query)
    );
  });

  protected readonly displayedColumns: string[] = [
    'symbol',
    'name',
    'price',
    'change',
    'volume',
    'marketCap',
    'sector',
    'actions',
  ];

  protected readonly totalValue = computed(() => {
    return this.symbols().reduce((total, symbol) => total + symbol.price, 0);
  });

  protected readonly positiveCount = computed(() => {
    return this.symbols().filter(symbol => symbol.change > 0).length;
  });

  protected readonly negativeCount = computed(() => {
    return this.symbols().filter(symbol => symbol.change < 0).length;
  });

  addSymbol(): void {
    const symbolToAdd = this.newSymbol.trim().toUpperCase();
    if (!symbolToAdd) return;

    // Check if symbol already exists
    const exists = this.symbols().some(s => s.symbol === symbolToAdd);
    if (exists) {
      console.log('Symbol already in watchlist');
      return;
    }

    // Create new symbol with mock data
    const newWatchlistSymbol: WatchlistSymbol = {
      symbol: symbolToAdd,
      name: `${symbolToAdd} Corporation`,
      price: Math.random() * 500 + 50,
      change: (Math.random() - 0.5) * 20,
      changePercent: 0,
      volume: Math.floor(Math.random() * 100000000),
      marketCap: `${Math.floor(Math.random() * 1000)}B`,
      sector: 'Unknown',
      addedDate: new Date(),
    };

    // Calculate change percent
    newWatchlistSymbol.changePercent = (newWatchlistSymbol.change / newWatchlistSymbol.price) * 100;

    this.symbols.update(symbols => [...symbols, newWatchlistSymbol]);
    this.newSymbol = '';
  }

  removeSymbol(symbolToRemove: string): void {
    this.symbols.update(symbols => symbols.filter(symbol => symbol.symbol !== symbolToRemove));
  }

  getChangeColor(change: number): string {
    return change >= 0 ? '#4caf50' : '#f44336';
  }

  getChangeIcon(change: number): string {
    return change >= 0 ? 'trending_up' : 'trending_down';
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num);
  }

  formatCurrency(num: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  }

  formatPercent(num: number): string {
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  }
}
