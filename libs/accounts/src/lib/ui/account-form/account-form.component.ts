import {
  Component,
  OnInit,
  input,
  output,
  effect,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { Textarea } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import {
  CreateAccountRequest,
  GetAccountResponse,
  UpdateAccountRequest,
} from '../../../data-access/src/lib/models/account.model';

/**
 * Form component for creating/editing accounts
 */
@Component({
  selector: 'lib-invenet-account-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    Select,
    DatePicker,
    InputNumberModule,
    Textarea,
    CheckboxModule,
    ButtonModule,
  ],
  templateUrl: './account-form.component.html',
  styleUrl: './account-form.component.css',
})
export class AccountFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  account = input<GetAccountResponse | null>(null);
  mode = input<'create' | 'update'>('create');
  isLoading = input<boolean>(false);
  submitLabel = input<string | null>(null);
  showCancel = input<boolean>(true);
  showTitle = input<boolean>(true);

  formSubmit = output<CreateAccountRequest | UpdateAccountRequest>();
  formCancel = output<void>();

  accountForm!: FormGroup;
  isEditMode = false;

  brokers = [
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

  accountTypes = [
    { label: 'Personal', value: 'Personal' },
    { label: 'Prop Firm', value: 'Prop Firm' },
    { label: 'Funded', value: 'Funded' },
  ];

  currencies = [
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

  timezones = [
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

  constructor() {
    // React to account changes for edit mode
    effect(() => {
      const acc = this.account();
      const currentMode = this.mode();

      if (acc && currentMode === 'update') {
        this.isEditMode = true;
        this.patchFormValues(acc);
      } else {
        this.isEditMode = false;
      }
    });
  }

  ngOnInit(): void {
    this.accountForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      broker: ['', [Validators.maxLength(100)]],
      accountType: ['', [Validators.required]],
      baseCurrency: ['', [Validators.required]],
      startDate: [new Date(), [Validators.required]],
      startingBalance: [1000, [Validators.required, Validators.min(0.01)]],
      timezone: ['America/New_York', [Validators.maxLength(50)]],
      notes: [''],
      isActive: [true],
      riskSettings: this.fb.group({
        riskPerTradePct: [
          2,
          [Validators.required, Validators.min(0), Validators.max(100)],
        ],
        maxDailyLossPct: [
          5,
          [Validators.required, Validators.min(0), Validators.max(100)],
        ],
        maxWeeklyLossPct: [
          10,
          [Validators.required, Validators.min(0), Validators.max(100)],
        ],
        enforceLimits: [true, [Validators.required]],
      }),
    });
  }

  private patchFormValues(account: GetAccountResponse): void {
    this.accountForm.patchValue({
      name: account.name,
      broker: account.broker,
      accountType: account.accountType,
      baseCurrency: account.baseCurrency,
      startDate: new Date(account.startDate),
      startingBalance: account.startingBalance,
      timezone: account.timezone,
      notes: account.notes,
      isActive: account.isActive,
      riskSettings: account.riskSettings
        ? {
            riskPerTradePct: account.riskSettings.riskPerTradePct,
            maxDailyLossPct: account.riskSettings.maxDailyLossPct,
            maxWeeklyLossPct: account.riskSettings.maxWeeklyLossPct,
            enforceLimits: account.riskSettings.enforceLimits,
          }
        : {
            riskPerTradePct: 2,
            maxDailyLossPct: 5,
            maxWeeklyLossPct: 10,
            enforceLimits: true,
          },
    });
  }

  onSubmit(): void {
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }

    const formValue = this.accountForm.getRawValue();
    const normalizedStartDate = this.toIsoDate(formValue.startDate);

    if (this.isEditMode) {
      const request: UpdateAccountRequest = {
        name: formValue.name,
        broker: formValue.broker,
        accountType: formValue.accountType,
        baseCurrency: formValue.baseCurrency,
        startDate: normalizedStartDate,
        startingBalance: formValue.startingBalance,
        timezone: formValue.timezone,
        notes: formValue.notes || undefined,
        riskSettings: formValue.riskSettings,
      };
      this.formSubmit.emit(request);
      return;
    }

    const request: CreateAccountRequest = {
      name: formValue.name,
      broker: formValue.broker,
      accountType: formValue.accountType,
      baseCurrency: formValue.baseCurrency,
      startDate: normalizedStartDate,
      startingBalance: formValue.startingBalance,
      timezone: formValue.timezone,
      notes: formValue.notes || undefined,
      isActive: formValue.isActive,
      riskSettings: formValue.riskSettings,
    };
    this.formSubmit.emit(request);
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  get name() {
    return this.accountForm.get('name');
  }

  get broker() {
    return this.accountForm.get('broker');
  }

  get accountType() {
    return this.accountForm.get('accountType');
  }

  get baseCurrency() {
    return this.accountForm.get('baseCurrency');
  }

  get startDate() {
    return this.accountForm.get('startDate');
  }

  get startingBalance() {
    return this.accountForm.get('startingBalance');
  }

  get timezone() {
    return this.accountForm.get('timezone');
  }

  get notes() {
    return this.accountForm.get('notes');
  }

  get resolvedSubmitLabel(): string {
    const customLabel = this.submitLabel();
    if (customLabel && customLabel.trim().length > 0) {
      return customLabel;
    }
    return this.isEditMode ? 'Update Account' : 'Create Account';
  }

  get isActive() {
    return this.accountForm.get('isActive');
  }

  get riskSettings() {
    return this.accountForm.get('riskSettings') as FormGroup;
  }

  get riskPerTradePct() {
    return this.riskSettings?.get('riskPerTradePct');
  }

  get maxDailyLossPct() {
    return this.riskSettings?.get('maxDailyLossPct');
  }

  get maxWeeklyLossPct() {
    return this.riskSettings?.get('maxWeeklyLossPct');
  }

  get enforceLimits() {
    return this.riskSettings?.get('enforceLimits');
  }

  private toIsoDate(value: string | Date | null): string {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value ?? new Date().toISOString();
  }
}
