import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Analytics } from './analytics';
import { TradingviewScriptLoaderService } from './services/tradingview-script-loader.service';

describe('Analytics', () => {
  let component: Analytics;
  let fixture: ComponentFixture<Analytics>;
  let scriptLoader: { load: ReturnType<typeof vi.fn> };
  let widgetSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    widgetSpy = vi.fn();
    scriptLoader = {
      load: vi.fn().mockResolvedValue(undefined),
    };
    (window as unknown as { TradingView: { widget: typeof widgetSpy } }).TradingView = {
      widget: widgetSpy,
    };

    await TestBed.configureTestingModule({
      imports: [Analytics],
      providers: [
        {
          provide: TradingviewScriptLoaderService,
          useValue: scriptLoader,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Analytics);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenRenderingDone();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render analytics summary and widget section', () => {
    const hostElement = fixture.nativeElement as HTMLElement;
    expect(hostElement.querySelector('[data-testid="analytics-summary"]')).toBeTruthy();
    expect(hostElement.querySelector('[data-testid="symbol-select"]')).toBeTruthy();
    expect(hostElement.querySelector('[data-testid="timeframe-select"]')).toBeTruthy();
  });

  it('should re-render widget when symbol or timeframe changes', async () => {
    const hostElement = fixture.nativeElement as HTMLElement;

    const symbolSelect = hostElement.querySelector(
      '[data-testid="symbol-select"]',
    ) as HTMLSelectElement;
    symbolSelect.value = 'NASDAQ:TSLA';
    symbolSelect.dispatchEvent(new Event('change'));

    const timeframeSelect = hostElement.querySelector(
      '[data-testid="timeframe-select"]',
    ) as HTMLSelectElement;
    timeframeSelect.value = '60';
    timeframeSelect.dispatchEvent(new Event('change'));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(widgetSpy).toHaveBeenCalled();
    const lastCallConfig = widgetSpy.mock.calls.at(-1)?.[0] as {
      symbol: string;
      interval: string;
    };
    expect(lastCallConfig.symbol).toBe('NASDAQ:TSLA');
    expect(lastCallConfig.interval).toBe('60');
  });

  it('should show an error state and keep summary visible when widget load fails', async () => {
    scriptLoader.load.mockRejectedValueOnce(new Error('Mock TradingView load failure'));
    fixture = TestBed.createComponent(Analytics);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const hostElement = fixture.nativeElement as HTMLElement;
    expect(hostElement.querySelector('[data-testid="widget-error"]')?.textContent).toContain(
      'Mock TradingView load failure',
    );
    expect(hostElement.querySelector('[data-testid="analytics-summary"]')).toBeTruthy();
  });
});
