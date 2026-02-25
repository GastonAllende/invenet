import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

export type AnalyticsWidgetTimeframe =
  | '1'
  | '5'
  | '15'
  | '60'
  | '240'
  | '1D'
  | '1W';

type AnalyticsWidgetState = {
  symbol: string;
  timeframe: AnalyticsWidgetTimeframe;
  isWidgetLoading: boolean;
  widgetError: string | null;
  refreshKey: number;
};

const initialState: AnalyticsWidgetState = {
  symbol: 'NASDAQ:AAPL',
  timeframe: '1D',
  isWidgetLoading: true,
  widgetError: null,
  refreshKey: 0,
};

export const AnalyticsWidgetStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    setSymbol(symbol: string): void {
      patchState(store, {
        symbol,
        widgetError: null,
      });
    },

    setTimeframe(timeframe: AnalyticsWidgetTimeframe): void {
      patchState(store, {
        timeframe,
        widgetError: null,
      });
    },

    setWidgetLoading(isWidgetLoading: boolean): void {
      patchState(store, { isWidgetLoading });
    },

    setWidgetError(widgetError: string | null): void {
      patchState(store, { widgetError });
    },

    retryWidget(): void {
      patchState(store, (state) => ({
        widgetError: null,
        isWidgetLoading: true,
        refreshKey: state.refreshKey + 1,
      }));
    },
  })),
);
