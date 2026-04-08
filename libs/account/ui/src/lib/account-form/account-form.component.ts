import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { PanelModule } from 'primeng/panel';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';
import { FluidModule } from 'primeng/fluid';
import {
  CreateAccountRequest,
  GetAccountResponse,
  UpdateAccountRequest,
} from '@invenet/account-data-access';

@Component({
  selector: 'lib-invenet-account-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    PanelModule,
    SelectModule,
    DatePickerModule,
    InputNumberModule,
    TextareaModule,
    CheckboxModule,
    ButtonModule,
    MessageModule,
    FluidModule,
  ],
  templateUrl: './account-form.component.html',
})
export class AccountFormComponent {
  private readonly fb = inject(FormBuilder);

  account = input<GetAccountResponse | null>(null);
  mode = input<'create' | 'update'>('create');
  isLoading = input<boolean>(false);
  submitLabel = input<string | null>(null);
  showCancel = input<boolean>(true);
  showTitle = input<boolean>(true);

  formSubmit = output<CreateAccountRequest | UpdateAccountRequest>();
  formCancel = output<void>();

  readonly isEditMode = computed(() => this.mode() === 'update' && !!this.account());

  readonly brokers = [
    { label: 'Interactive Brokers', value: 'Interactive Brokers' },
    { label: 'TD Ameritrade', value: 'TD Ameritrade' },
    { label: 'Charles Schwab', value: 'Charles Schwab' },
    { label: 'E*TRADE', value: 'E*TRADE' },
    { label: 'Fidelity', value: 'Fidelity' },
    { label: 'OANDA', value: 'OANDA' },
    { label: 'IG Markets', value: 'IG Markets' },
    { label: 'Saxo Bank', value: 'Saxo Bank' },
    { label: 'FTMO', value: 'FTMO' },
    { label: 'Other', value: 'Other' },
  ];

  readonly accountTypes = [
    { label: 'Personal', value: 'Personal' },
    { label: 'Prop Firm', value: 'Prop Firm' },
    { label: 'Funded', value: 'Funded' },
  ];

  readonly currencies = [
    { label: 'USD', value: 'USD' },
    { label: 'EUR', value: 'EUR' },
    { label: 'GBP', value: 'GBP' },
    { label: 'JPY', value: 'JPY' },
    { label: 'CHF', value: 'CHF' },
    { label: 'AUD', value: 'AUD' },
    { label: 'CAD', value: 'CAD' },
    { label: 'NZD', value: 'NZD' },
    { label: 'SEK', value: 'SEK' },
    { label: 'NOK', value: 'NOK' },
  ];

  readonly timezones = [
    { label: 'UTC', value: 'UTC' },
    { label: 'Europe/Stockholm', value: 'Europe/Stockholm' },
    { label: 'Europe/London', value: 'Europe/London' },
    { label: 'Europe/Paris', value: 'Europe/Paris' },
    { label: 'America/New_York', value: 'America/New_York' },
    { label: 'America/Chicago', value: 'America/Chicago' },
    { label: 'America/Los_Angeles', value: 'America/Los_Angeles' },
    { label: 'Asia/Tokyo', value: 'Asia/Tokyo' },
    { label: 'Asia/Hong_Kong', value: 'Asia/Hong_Kong' },
    { label: 'Asia/Singapore', value: 'Asia/Singapore' },
    { label: 'Australia/Sydney', value: 'Australia/Sydney' },
    { label: 'Pacific/Auckland', value: 'Pacific/Auckland' },
  ];

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    broker: ['', [Validators.maxLength(100)]],
    accountType: ['', [Validators.required]],
    baseCurrency: ['USD', [Validators.required]],
    startDate: [new Date() as Date, [Validators.required]],
    startingBalance: [1000 as number, [Validators.required, Validators.min(0.01)]],
    timezone: ['America/New_York', [Validators.maxLength(50)]],
    notes: [''],
    isActive: [true],
    riskSettings: this.fb.group({
      riskPerTradePct: [2, [Validators.required, Validators.min(0), Validators.max(100)]],
      maxDailyLossPct: [5, [Validators.required, Validators.min(0), Validators.max(100)]],
      maxWeeklyLossPct: [10, [Validators.required, Validators.min(0), Validators.max(100)]],
      enforceLimits: [true, [Validators.required]],
    }),
  });

  get resolvedSubmitLabel(): string {
    const customLabel = this.submitLabel();
    if (customLabel?.trim()) return customLabel;
    return this.isEditMode() ? 'Update Account' : 'Create Account';
  }

  constructor() {
    effect(() => {
      const acc = this.account();
      if (acc && this.mode() === 'update') {
        this.form.patchValue({
          name: acc.name,
          broker: acc.broker,
          accountType: acc.accountType,
          baseCurrency: acc.baseCurrency,
          startDate: new Date(acc.startDate),
          startingBalance: acc.startingBalance,
          timezone: acc.timezone,
          notes: acc.notes,
          isActive: acc.isActive,
          riskSettings: acc.riskSettings ?? {
            riskPerTradePct: 2,
            maxDailyLossPct: 5,
            maxWeeklyLossPct: 10,
            enforceLimits: true,
          },
        });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    const startDate = this.toIsoDate(formValue.startDate);

    if (this.isEditMode()) {
      this.formSubmit.emit({
        name: formValue.name,
        broker: formValue.broker,
        accountType: formValue.accountType,
        baseCurrency: formValue.baseCurrency,
        startDate,
        startingBalance: formValue.startingBalance,
        timezone: formValue.timezone,
        notes: formValue.notes || undefined,
        riskSettings: formValue.riskSettings,
      } as UpdateAccountRequest);
      return;
    }

    this.formSubmit.emit({
      name: formValue.name,
      broker: formValue.broker,
      accountType: formValue.accountType,
      baseCurrency: formValue.baseCurrency,
      startDate,
      startingBalance: formValue.startingBalance,
      timezone: formValue.timezone,
      notes: formValue.notes || undefined,
      isActive: formValue.isActive,
      riskSettings: formValue.riskSettings,
    } as CreateAccountRequest);
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  private toIsoDate(value: string | Date | null): string {
    if (value instanceof Date) return value.toISOString();
    return value ?? new Date().toISOString();
  }
}
