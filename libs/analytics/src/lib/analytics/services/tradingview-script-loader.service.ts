import { Injectable } from '@angular/core';

type TradingViewGlobal = {
  TradingView?: {
    widget: new (config: Record<string, unknown>) => unknown;
  };
};

@Injectable({ providedIn: 'root' })
export class TradingviewScriptLoaderService {
  private static scriptLoadPromise: Promise<void> | null = null;

  load(): Promise<void> {
    const windowWithTradingView = window as unknown as TradingViewGlobal;
    const scriptId = 'tradingview-widget-script';

    if (windowWithTradingView.TradingView?.widget) {
      return Promise.resolve();
    }

    if (TradingviewScriptLoaderService.scriptLoadPromise) {
      return TradingviewScriptLoaderService.scriptLoadPromise;
    }

    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      TradingviewScriptLoaderService.scriptLoadPromise = new Promise<void>(
        (resolve, reject) => {
          existingScript.addEventListener('load', () => resolve(), {
            once: true,
          });
          existingScript.addEventListener(
            'error',
            () => {
              TradingviewScriptLoaderService.scriptLoadPromise = null;
              reject(new Error('Failed to load TradingView script'));
            },
            { once: true },
          );
        },
      );
      return TradingviewScriptLoaderService.scriptLoadPromise;
    }

    TradingviewScriptLoaderService.scriptLoadPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;

      script.onload = () => resolve();
      script.onerror = () => {
        TradingviewScriptLoaderService.scriptLoadPromise = null;
        reject(new Error('Failed to load TradingView script'));
      };

      document.head.appendChild(script);
    });

    return TradingviewScriptLoaderService.scriptLoadPromise;
  }
}
