import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StrategyFormComponent } from './strategy-form.component';
import type { GetStrategyResponse } from '../../data-access/models';

describe('StrategyFormComponent', () => {
  let fixture: ComponentFixture<StrategyFormComponent>;
  let component: StrategyFormComponent;

  const strategy: GetStrategyResponse = {
    id: 'str-1',
    name: 'Trend Following',
    market: 'Stocks',
    defaultTimeframe: '1D',
    isArchived: false,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    currentVersion: {
      id: 'v-1',
      versionNumber: 1,
      timeframe: '1H',
      entryRules: 'Entry',
      exitRules: 'Exit',
      riskRules: 'Risk',
      notes: 'Notes',
      createdAt: '2025-01-01T00:00:00.000Z',
      createdByUserId: 'user-1',
    },
    versions: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StrategyFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StrategyFormComponent);
    component = fixture.componentInstance;
  });

  it('shows metadata fields in version mode as read-only', () => {
    fixture.componentRef.setInput('mode', 'version');
    fixture.componentRef.setInput('strategy', strategy);
    fixture.detectChanges();

    const nameInput = fixture.nativeElement.querySelector('#name');
    const marketInput = fixture.nativeElement.querySelector('#market');
    const timeframeInput =
      fixture.nativeElement.querySelector('#defaultTimeframe');

    expect(nameInput).toBeTruthy();
    expect(marketInput).toBeTruthy();
    expect(timeframeInput).toBeTruthy();
    expect(component.form.controls.name.disabled).toBe(true);
    expect(component.form.controls.market.disabled).toBe(true);
    expect(component.form.controls.defaultTimeframe.disabled).toBe(true);
  });

  it('emits version payload with editable rules fields', () => {
    const emitSpy = vi.spyOn(component.save, 'emit');
    fixture.componentRef.setInput('mode', 'version');
    fixture.componentRef.setInput('strategy', strategy);
    fixture.detectChanges();

    component.form.patchValue({
      timeframe: '4H',
      entryRules: 'New entry',
      exitRules: 'New exit',
      riskRules: 'New risk',
      notes: 'Updated notes',
    });

    component.onSubmit();

    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy.mock.calls[0][0]).toEqual({
      timeframe: '4H',
      entryRules: 'New entry',
      exitRules: 'New exit',
      riskRules: 'New risk',
      notes: 'Updated notes',
    });
  });

  it('uses explicit version submit label', () => {
    fixture.componentRef.setInput('mode', 'version');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Create Version');
  });
});
