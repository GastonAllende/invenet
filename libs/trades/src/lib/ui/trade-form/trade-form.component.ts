import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import {
  CreateTradeRequest,
  UpdateTradeRequest,
  Trade,
} from '../../../data-access/src';

interface SelectOption {
  id: string;
  name: string;
}

const TRADE_TYPE_OPTIONS = [
  { label: 'BUY', value: 'BUY' },
  { label: 'SELL', value: 'SELL' },
];

const TRADE_STATUS_OPTIONS = [
  { label: 'Open', value: 'Open' },
  { label: 'Win', value: 'Win' },
  { label: 'Loss', value: 'Loss' },
];

@Component({
  selector: 'lib-trade-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    DatePickerModule,
  ],
  templateUrl: './trade-form.component.html',
  styleUrl: './trade-form.component.css',
})
export class TradeFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  trade = input<Trade | null>(null);
  accounts = input<SelectOption[]>([]);
  strategies = input<SelectOption[]>([]);
  isLoading = input<boolean>(false);

  save = output<CreateTradeRequest | UpdateTradeRequest>();
  formCancel = output<void>();

  readonly typeOptions = TRADE_TYPE_OPTIONS;
  readonly statusOptions = TRADE_STATUS_OPTIONS;

  form: FormGroup = this.fb.group({
    accountId: ['', Validators.required],
    strategyId: [null],
    type: ['BUY', Validators.required],
    date: [new Date(), Validators.required],
    symbol: ['', [Validators.required, Validators.maxLength(20)]],
    entryPrice: [null, [Validators.required, Validators.min(0.0001)]],
    exitPrice: [null, Validators.min(0.0001)],
    positionSize: [null, [Validators.required, Validators.min(0.000001)]],
    commission: [0, [Validators.required, Validators.min(0)]],
    status: ['Open', Validators.required],
    investedAmount: [{ value: null, disabled: true }],
    profitLoss: [{ value: null, disabled: true }],
  });

  constructor() {
    // Sync form with incoming trade signal
    effect(() => {
      const t = this.trade();
      if (t) {
        this.form.patchValue({
          accountId: t.accountId,
          strategyId: t.strategyId ?? null,
          type: t.type,
          date: new Date(t.date),
          symbol: t.symbol,
          entryPrice: t.entryPrice,
          exitPrice: t.exitPrice ?? null,
          positionSize: t.positionSize,
          commission: t.commission,
          status: t.status,
          investedAmount: t.investedAmount,
          profitLoss: t.profitLoss,
        });
      } else {
        this.form.reset({
          accountId: '',
          strategyId: null,
          type: 'BUY',
          date: new Date(),
          symbol: '',
          entryPrice: null,
          exitPrice: null,
          positionSize: null,
          commission: 0,
          status: 'Open',
          investedAmount: null,
          profitLoss: null,
        });
      }
    });

    // Auto-calculate investedAmount and profitLoss on relevant field changes
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const { entryPrice, exitPrice, positionSize, commission } =
          this.form.value;

        const entry = entryPrice ?? 0;
        const size = positionSize ?? 0;
        const comm = commission ?? 0;
        const invested = entry * size;

        const updates: Record<string, number | null> = {
          investedAmount: invested,
          profitLoss: null,
        };

        if (exitPrice != null) {
          const gross = (exitPrice - entry) * size;
          updates['profitLoss'] = gross - comm;
        }

        this.form.patchValue(updates, { emitEvent: false });
      });
  }

  get isEditMode(): boolean {
    return this.trade() !== null;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const dateValue =
      raw.date instanceof Date ? raw.date.toISOString() : raw.date;

    if (this.isEditMode) {
      const request: UpdateTradeRequest = {
        strategyId: raw.strategyId || undefined,
        type: raw.type,
        date: dateValue,
        symbol: raw.symbol,
        entryPrice: raw.entryPrice,
        exitPrice: raw.exitPrice || undefined,
        positionSize: raw.positionSize,
        investedAmount: raw.investedAmount ?? 0,
        commission: raw.commission,
        profitLoss: raw.profitLoss ?? 0,
        status: raw.status,
      };
      this.save.emit(request);
    } else {
      const request: CreateTradeRequest = {
        accountId: raw.accountId,
        strategyId: raw.strategyId || undefined,
        type: raw.type,
        date: dateValue,
        symbol: raw.symbol,
        entryPrice: raw.entryPrice,
        exitPrice: raw.exitPrice || undefined,
        positionSize: raw.positionSize,
        investedAmount: raw.investedAmount ?? 0,
        commission: raw.commission,
        profitLoss: raw.profitLoss ?? 0,
        status: raw.status,
      };
      this.save.emit(request);
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }
}
