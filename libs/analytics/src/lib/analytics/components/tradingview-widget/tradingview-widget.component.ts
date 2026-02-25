import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { TradingviewScriptLoaderService } from '../../services/tradingview-script-loader.service';

type TradingViewGlobal = {
  TradingView?: {
    widget: new (config: Record<string, unknown>) => unknown;
  };
};

let widgetContainerCounter = 0;

@Component({
  selector: 'lib-tradingview-widget',
  template: '<div class="widget-host" [id]="containerId"></div>',
  styles: [
    `
      .widget-host {
        min-height: 420px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradingviewWidgetComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) symbol = '';
  @Input({ required: true }) timeframe = '';
  @Input() refreshKey = 0;

  @Output() loadingChange = new EventEmitter<boolean>();
  @Output() errorChange = new EventEmitter<string | null>();

  private readonly scriptLoader = inject(TradingviewScriptLoaderService);
  private readonly hostElement = inject(ElementRef<HTMLElement>);

  protected readonly containerId = `tradingview-widget-container-${widgetContainerCounter++}`;

  private isDestroyed = false;

  ngOnInit(): void {
    this.renderWidget();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['symbol'] && !changes['timeframe'] && !changes['refreshKey']) {
      return;
    }

    if (!changes['symbol']?.firstChange || !changes['timeframe']?.firstChange || !changes['refreshKey']?.firstChange) {
      this.renderWidget();
    }
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.clearContainer();
  }

  private async renderWidget(): Promise<void> {
    if (this.isDestroyed) {
      return;
    }

    this.loadingChange.emit(true);
    this.errorChange.emit(null);

    this.clearContainer();

    try {
      await this.scriptLoader.load();

      if (this.isDestroyed) {
        return;
      }

      const windowWithTradingView = window as unknown as TradingViewGlobal;
      const WidgetConstructor = windowWithTradingView.TradingView?.widget;

      if (!WidgetConstructor) {
        throw new Error('TradingView widget API is unavailable');
      }

      // eslint-disable-next-line no-new
      new WidgetConstructor({
        autosize: true,
        symbol: this.symbol,
        interval: this.timeframe,
        timezone: 'Etc/UTC',
        theme: 'light',
        style: '1',
        locale: 'en',
        hide_top_toolbar: false,
        allow_symbol_change: false,
        container_id: this.containerId,
      });

      this.loadingChange.emit(false);
    } catch (error) {
      if (this.isDestroyed) {
        return;
      }

      const message = error instanceof Error ? error.message : 'Unable to load TradingView widget';
      this.loadingChange.emit(false);
      this.errorChange.emit(message);
    }
  }

  private clearContainer(): void {
    const container = this.hostElement.nativeElement.querySelector(`#${this.containerId}`);
    if (container) {
      container.innerHTML = '';
    }
  }
}
