import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TradeListComponent } from './trade-list.component';
import type { Trade } from '@invenet/trade-data-access';

describe('TradeListComponent', () => {
  let fixture: ComponentFixture<TradeListComponent>;

  const sampleTrade: Trade = {
    id: 'trade-1',
    accountId: 'acc-1',
    strategyVersionId: null,
    strategyId: null,
    strategyName: null,
    strategyVersionNumber: null,
    direction: 'Long',
    openedAt: '2025-01-10T00:00:00.000Z',
    closedAt: null,
    symbol: 'AAPL',
    entryPrice: 100,
    exitPrice: null,
    quantity: 10,
    rMultiple: null,
    pnl: null,
    isArchived: false,
    status: 'Open',
    createdAt: '2025-01-10T00:00:00.000Z',
    updatedAt: '2025-01-10T00:00:00.000Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradeListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TradeListComponent);
  });

  it('should be defined', () => {
    expect(TradeListComponent).toBeDefined();
  });

  it('renders a row for each trade passed in', () => {
    fixture.componentRef.setInput('trades', [sampleTrade]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('AAPL');
  });
});
