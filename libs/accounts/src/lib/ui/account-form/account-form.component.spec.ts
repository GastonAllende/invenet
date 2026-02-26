import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountFormComponent } from './account-form.component';
import type { GetAccountResponse } from '../../../data-access/src/lib/models/account.model';

describe('AccountFormComponent', () => {
  let fixture: ComponentFixture<AccountFormComponent>;
  let component: AccountFormComponent;

  const existingAccount: GetAccountResponse = {
    id: 'acc-1',
    name: 'Main Account',
    broker: 'Interactive Brokers',
    accountType: 'Personal',
    baseCurrency: 'USD',
    startDate: '2025-01-10T00:00:00.000Z',
    startingBalance: 1200,
    timezone: 'UTC',
    notes: 'existing notes',
    isActive: true,
    createdAt: '2025-01-10T00:00:00.000Z',
    updatedAt: '2025-01-10T00:00:00.000Z',
    riskSettings: {
      id: 'risk-1',
      accountId: 'acc-1',
      riskPerTradePct: 2,
      maxDailyLossPct: 5,
      maxWeeklyLossPct: 10,
      enforceLimits: true,
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('emits create payload with ISO startDate', () => {
    const emitSpy = vi.spyOn(component.formSubmit, 'emit');
    const startDate = new Date('2025-02-01T00:00:00.000Z');

    component.accountForm.patchValue({
      name: 'New Account',
      broker: 'Interactive Brokers',
      accountType: 'Personal',
      baseCurrency: 'USD',
      startDate,
      startingBalance: 3000,
      timezone: 'UTC',
      notes: 'note',
      isActive: true,
      riskSettings: {
        riskPerTradePct: 2,
        maxDailyLossPct: 5,
        maxWeeklyLossPct: 10,
        enforceLimits: true,
      },
    });

    component.onSubmit();

    expect(emitSpy).toHaveBeenCalledTimes(1);
    const payload = emitSpy.mock.calls[0][0] as { startDate: string };
    expect(payload.startDate).toBe(startDate.toISOString());
  });

  it('emits update payload including editable startDate and startingBalance', () => {
    const emitSpy = vi.spyOn(component.formSubmit, 'emit');
    const updatedStartDate = new Date('2025-03-01T00:00:00.000Z');

    fixture.componentRef.setInput('mode', 'update');
    fixture.componentRef.setInput('account', existingAccount);
    fixture.detectChanges();

    component.accountForm.patchValue({
      startDate: updatedStartDate,
      startingBalance: 5500,
    });

    component.onSubmit();

    expect(emitSpy).toHaveBeenCalledTimes(1);
    const payload = emitSpy.mock.calls[0][0] as {
      startDate: string;
      startingBalance: number;
    };
    expect(payload.startDate).toBe(updatedStartDate.toISOString());
    expect(payload.startingBalance).toBe(5500);
  });

  it('uses explicit update label in update mode', () => {
    fixture.componentRef.setInput('mode', 'update');
    fixture.componentRef.setInput('account', existingAccount);
    fixture.detectChanges();

    expect(component.resolvedSubmitLabel).toBe('Update Account');
  });
});
