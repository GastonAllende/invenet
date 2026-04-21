import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';
import { FluidModule } from 'primeng/fluid';
import { StrategiesStore } from '@invenet/strategy-data-access';
import {
  CreateTradeRequest,
  Trade,
  TradeDirection,
  TradeStatus,
  UpdateTradeRequest,
} from '@invenet/trade-data-access';

interface SelectOption {
  id: string;
  name: string;
}

@Component({
  selector: 'lib-trade-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    DatePickerModule,
    TextareaModule,
    MessageModule,
    FluidModule,
  ],
  templateUrl: './trade-form.component.html',
})
export class TradeFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly strategiesStore = inject(StrategiesStore);
  private readonly isPatchingStrategy = signal(false);
  private readonly initialStrategyId = signal<string | null>(null);

  mode = input<'create' | 'edit'>('create');
  trade = input<Trade | null>(null);
  accounts = input<SelectOption[]>([]);
  defaultAccountId = input<string | null>(null);
  strategies = input<SelectOption[]>([]);
  isLoading = input<boolean>(false);

  save = output<CreateTradeRequest | UpdateTradeRequest>();
  formCancel = output<void>();

  readonly directionOptions = [
    { label: 'Long', value: 'Long' },
    { label: 'Short', value: 'Short' },
  ];

  readonly statusOptions = [
    { label: 'Open', value: 'Open' },
    { label: 'Closed', value: 'Closed' },
  ];

  readonly form = this.fb.group({
    accountId: ['', Validators.required],
    strategyId: [null as string | null],
    strategyVersionId: [null as string | null],
    direction: ['Long', Validators.required],
    openedAt: [new Date(), Validators.required],
    closedAt: [null as Date | null],
    symbol: ['', [Validators.required, Validators.maxLength(20)]],
    entryPrice: [
      null as number | null,
      [Validators.required, Validators.min(0.0001)],
    ],
    exitPrice: [null as number | null],
    quantity: [null as number | null],
    rMultiple: [null as number | null],
    pnl: [null as number | null],
    tags: [''],
    notes: [''],
    status: ['Open', Validators.required],
  });

  constructor() {
    effect(() => {
      const t = this.trade();
      if (t && this.mode() === 'edit') {
        this.initialStrategyId.set(t.strategyId);
        this.form.patchValue({
          accountId: t.accountId,
          strategyId: t.strategyId,
          strategyVersionId: t.strategyVersionId,
          direction: t.direction,
          openedAt: new Date(t.openedAt),
          closedAt: t.closedAt ? new Date(t.closedAt) : null,
          symbol: t.symbol,
          entryPrice: t.entryPrice,
          exitPrice: t.exitPrice,
          quantity: t.quantity,
          rMultiple: t.rMultiple,
          pnl: t.pnl,
          tags: (t.tags ?? []).join(', '),
          notes: t.notes ?? '',
          status: t.status,
        });
      } else {
        this.initialStrategyId.set(null);
        this.form.reset({
          accountId: this.defaultAccountId() ?? '',
          strategyId: null,
          strategyVersionId: null,
          direction: 'Long',
          openedAt: new Date(),
          closedAt: null,
          symbol: '',
          entryPrice: null,
          exitPrice: null,
          quantity: null,
          rMultiple: null,
          pnl: null,
          tags: '',
          notes: '',
          status: 'Open',
        });
      }
    });

    effect(() => {
      const status = this.form.controls.status.value;
      const exitPrice = this.form.controls.exitPrice;
      const closedAt = this.form.controls.closedAt;

      if (status === 'Closed') {
        exitPrice.setValidators([Validators.required, Validators.min(0.0001)]);
        closedAt.setValidators([Validators.required]);
      } else {
        exitPrice.clearValidators();
        closedAt.clearValidators();
      }

      exitPrice.updateValueAndValidity({ emitEvent: false });
      closedAt.updateValueAndValidity({ emitEvent: false });
    });

    this.form.controls.strategyId.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((strategyId) => this.onStrategyIdChange(strategyId));
  }

  get isEditMode(): boolean {
    return this.mode() === 'edit';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.save.emit(this.buildTradePayload());
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  private onStrategyIdChange(strategyId: string | null): void {
    if (this.mode() !== 'edit' || this.isPatchingStrategy()) return;
    if ((strategyId ?? null) === this.initialStrategyId()) return;

    const confirmed = window.confirm(
      'Changing the strategy will update the strategy version to the current version. Continue?',
    );

    if (!confirmed) {
      this.isPatchingStrategy.set(true);
      this.form.controls.strategyId.setValue(this.initialStrategyId());
      this.isPatchingStrategy.set(false);
      return;
    }

    if (!strategyId) {
      this.form.controls.strategyVersionId.setValue(null);
      this.initialStrategyId.set(null);
      return;
    }

    const strategy = this.strategiesStore.entityMap()[strategyId];
    if (strategy) {
      this.form.controls.strategyVersionId.setValue(strategy.currentVersion?.id ?? null);
      this.initialStrategyId.set(strategyId);
    } else {
      this.isPatchingStrategy.set(true);
      this.form.controls.strategyId.setValue(this.initialStrategyId());
      this.isPatchingStrategy.set(false);
    }
  }

  private buildTradePayload(): CreateTradeRequest | UpdateTradeRequest {
    return this.isEditMode ? this.buildUpdateRequest() : this.buildCreateRequest();
  }

  private parseFormDates(raw: ReturnType<typeof this.form.getRawValue>) {
    const openedAt =
      raw.openedAt instanceof Date ? raw.openedAt.toISOString() : `${raw.openedAt}`;
    const closedAt =
      raw.closedAt instanceof Date
        ? raw.closedAt.toISOString()
        : raw.closedAt
          ? `${raw.closedAt}`
          : undefined;
    return { openedAt, closedAt };
  }

  private parseFormTags(raw: ReturnType<typeof this.form.getRawValue>): string[] {
    return (raw.tags ?? '')
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
  }

  private buildUpdateRequest(): UpdateTradeRequest {
    const raw = this.form.getRawValue();
    const { openedAt, closedAt } = this.parseFormDates(raw);
    return {
      strategyId: raw.strategyId ?? undefined,
      strategyVersionId: raw.strategyVersionId ?? undefined,
      direction: (raw.direction ?? 'Long') as TradeDirection,
      openedAt,
      closedAt,
      symbol: (raw.symbol ?? '').toUpperCase(),
      entryPrice: raw.entryPrice ?? 0,
      exitPrice: raw.exitPrice ?? undefined,
      quantity: raw.quantity ?? undefined,
      rMultiple: raw.rMultiple ?? undefined,
      pnl: raw.pnl ?? undefined,
      tags: this.parseFormTags(raw),
      notes: raw.notes ?? undefined,
      status: (raw.status ?? 'Open') as TradeStatus,
    };
  }

  private buildCreateRequest(): CreateTradeRequest {
    const raw = this.form.getRawValue();
    const { openedAt, closedAt } = this.parseFormDates(raw);
    return {
      accountId: raw.accountId ?? '',
      strategyId: raw.strategyId ?? undefined,
      strategyVersionId: raw.strategyVersionId ?? undefined,
      direction: (raw.direction ?? 'Long') as TradeDirection,
      openedAt,
      closedAt,
      symbol: (raw.symbol ?? '').toUpperCase(),
      entryPrice: raw.entryPrice ?? 0,
      exitPrice: raw.exitPrice ?? undefined,
      quantity: raw.quantity ?? undefined,
      rMultiple: raw.rMultiple ?? undefined,
      pnl: raw.pnl ?? undefined,
      tags: this.parseFormTags(raw),
      notes: raw.notes ?? undefined,
      status: (raw.status ?? 'Open') as TradeStatus,
    };
  }
}
