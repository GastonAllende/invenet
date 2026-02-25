import { TradingviewScriptLoaderService } from './tradingview-script-loader.service';

describe('TradingviewScriptLoaderService', () => {
  let service: TradingviewScriptLoaderService;

  beforeEach(() => {
    service = new TradingviewScriptLoaderService();
    (TradingviewScriptLoaderService as unknown as { scriptLoadPromise: Promise<void> | null }).scriptLoadPromise = null;
    delete (window as unknown as { TradingView?: unknown }).TradingView;
    document.getElementById('tradingview-widget-script')?.remove();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.getElementById('tradingview-widget-script')?.remove();
  });

  it('should inject the script only once across multiple calls', async () => {
    const appendSpy = vi.spyOn(document.head, 'appendChild');

    const firstLoad = service.load();
    const secondLoad = service.load();

    expect(appendSpy).toHaveBeenCalledTimes(1);

    const scriptElement = document.getElementById(
      'tradingview-widget-script',
    ) as HTMLScriptElement;
    expect(scriptElement).toBeTruthy();
    scriptElement.dispatchEvent(new Event('load'));

    await Promise.all([firstLoad, secondLoad]);
  });

  it('should resolve immediately when TradingView is already available', async () => {
    (window as unknown as { TradingView: { widget: () => void } }).TradingView = {
      widget: vi.fn(),
    };
    const appendSpy = vi.spyOn(document.head, 'appendChild');

    await expect(service.load()).resolves.toBeUndefined();
    expect(appendSpy).not.toHaveBeenCalled();
  });
});
