import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  AnalyticsWidgetStore,
  AnalyticsWidgetTimeframe,
} from './state/analytics-widget.store';
import { TradingviewWidgetComponent } from './components/tradingview-widget/tradingview-widget.component';

@Component({
  selector: 'lib-analytics',
  imports: [TradingviewWidgetComponent],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Analytics {
  protected readonly store = inject(AnalyticsWidgetStore);

  protected readonly symbols = [
    { label: 'Apple (AAPL)', value: 'NASDAQ:AAPL' },
    { label: 'Tesla (TSLA)', value: 'NASDAQ:TSLA' },
    { label: 'NVIDIA (NVDA)', value: 'NASDAQ:NVDA' },
    { label: 'Microsoft (MSFT)', value: 'NASDAQ:MSFT' },
    { label: 'Bitcoin (BTCUSD)', value: 'BITSTAMP:BTCUSD' },
    { label: 'Ethereum (ETHUSD)', value: 'BITSTAMP:ETHUSD' },
  ] as const;

  protected readonly timeframes: ReadonlyArray<{
    label: string;
    value: AnalyticsWidgetTimeframe;
  }> = [
    { label: '1m', value: '1' },
    { label: '5m', value: '5' },
    { label: '15m', value: '15' },
    { label: '1h', value: '60' },
    { label: '4h', value: '240' },
    { label: '1D', value: '1D' },
    { label: '1W', value: '1W' },
  ];

  protected onSymbolChange(event: Event): void {
    const target = event.target as HTMLSelectElement | null;
    if (!target?.value) {
      return;
    }

    this.store.setSymbol(target.value);
  }

  protected onTimeframeChange(event: Event): void {
    const target = event.target as HTMLSelectElement | null;
    if (!target?.value) {
      return;
    }

    this.store.setTimeframe(target.value as AnalyticsWidgetTimeframe);
  }
}
