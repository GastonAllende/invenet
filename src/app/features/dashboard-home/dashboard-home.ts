import {
  ChangeDetectionStrategy,
  Component,
  signal,
  OnInit,
  afterNextRender,
  Injector,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-dashboard-home',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.scss',
})
export class DashboardHome implements OnInit {
  protected readonly showWelcomeCard = signal(true);

  constructor(private injector: Injector) {
    afterNextRender(
      () => {
        this.loadTradingViewWidget();
      },
      { injector: this.injector }
    );
  }

  ngOnInit(): void {
    // Component initialization
  }

  private loadTradingViewWidget(): void {
    // Add a small delay to ensure DOM is fully ready
    setTimeout(() => {
      this.createTradingViewWidget();
    }, 100);
  }

  private createTradingViewWidget(): void {
    const container = document.getElementById('tradingview_widget');
    if (!container) {
      console.error('TradingView container not found');
      return;
    }

    // Clear any existing content
    container.innerHTML = '';

    // Create the widget using the embed approach
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        ['SOXL', 'SOXL|12m'],
        ['TQQQ', 'TQQQ|12m'],
        ['UPRO', 'UPRO|12m'],
      ],
      chartOnly: false,
      width: '100%',
      height: '400',
      locale: 'en',
      colorTheme: 'light',
      autosize: false,
      showVolume: false,
      showMA: false,
      hideDateRanges: false,
      hideMarketStatus: false,
      hideSymbolLogo: false,
      scalePosition: 'right',
      scaleMode: 'Normal',
      fontFamily: '-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif',
      fontSize: '10',
      noTimeScale: false,
      valuesTracking: '1',
      changeMode: 'price-and-percent',
      chartType: 'candlesticks',
      headerFontSize: 'medium',
      lineWidth: 2,
      lineType: 0,
      dateRanges: ['1d|1', '1m|30', '3m|60', '12m|1D', '60m|1W', 'all|1M'],
    });

    container.appendChild(script);
  }

  protected readonly marketStatus = signal({
    text: 'Market Open',
    icon: 'radio_button_checked',
    class: 'market-open',
  });

  protected readonly portfolioStats = signal([
    {
      title: 'Portfolio Value',
      value: '$156,842.50',
      icon: 'account_balance_wallet',
      color: '#2196f3',
      change: '+2.34%',
      trend: 'positive',
    },
    {
      title: "Today's P&L",
      value: '+$3,642.18',
      icon: 'trending_up',
      color: '#4caf50',
      change: '+1.87%',
      trend: 'positive',
    },
    {
      title: 'Total Return',
      value: '+$23,842.50',
      icon: 'show_chart',
      color: '#4caf50',
      change: '+18.24%',
      trend: 'positive',
    },
    {
      title: 'Buying Power',
      value: '$42,158.30',
      icon: 'account_balance',
      color: '#ff9800',
      change: null,
      trend: 'neutral',
    },
  ]);

  protected readonly topPositions = signal([
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      shares: '125',
      value: '23,156.25',
      pnl: '+$1,842.50 (+8.6%)',
      allocation: 14.8,
      trend: 'positive',
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      shares: '87',
      value: '19,847.22',
      pnl: '+$2,156.78 (+12.2%)',
      allocation: 12.7,
      trend: 'positive',
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corp.',
      shares: '56',
      value: '18,642.18',
      pnl: '-$642.82 (-3.3%)',
      allocation: 11.9,
      trend: 'negative',
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      shares: '45',
      value: '15,234.67',
      pnl: '+$834.22 (+5.8%)',
      allocation: 9.7,
      trend: 'positive',
    },
  ]);

  protected readonly quickActions = signal([
    {
      title: 'Place Order',
      description: 'Buy or sell securities',
      icon: 'add_shopping_cart',
      color: '#2196f3',
      action: 'place-order',
    },
    {
      title: 'Market Research',
      description: 'Analyze stocks and trends',
      icon: 'analytics',
      color: '#9c27b0',
      action: 'research',
    },
    {
      title: 'Portfolio Analysis',
      description: 'Review performance metrics',
      icon: 'pie_chart',
      color: '#4caf50',
      action: 'analysis',
    },
    {
      title: 'Watchlist',
      description: 'Monitor favorite stocks',
      icon: 'visibility',
      color: '#ff9800',
      action: 'watchlist',
    },
  ]);

  hideWelcomeCard(): void {
    this.showWelcomeCard.set(false);
  }

  handleQuickAction(action: string): void {
    switch (action) {
      case 'place-order':
        console.log('Navigate to place order');
        break;
      case 'research':
        console.log('Navigate to market research');
        break;
      case 'analysis':
        console.log('Navigate to portfolio analysis');
        break;
      case 'watchlist':
        console.log('Navigate to watchlist');
        break;
      default:
        console.log('Unknown action:', action);
    }
  }
}
