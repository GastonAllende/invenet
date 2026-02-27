import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { StrategiesApiService } from '@invenet/strategies';
import {
  CreateTradeRequest,
  Trade,
  UpdateTradeRequest,
} from '../../../data-access/src';

interface SelectOption {
  id: string;
  name: string;
}

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
    TextareaModule,
  ],
  templateUrl: './trade-form.component.html',
  styleUrl: './trade-form.component.css',
})
export class TradeFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly strategiesApiService = inject(StrategiesApiService);
  private isPatchingStrategy = false;
  private initialStrategyId: string | null = null;

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
    direction: this.fb.control<'Long' | 'Short'>('Long', Validators.required),
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
    status: this.fb.control<'Open' | 'Closed'>('Open', Validators.required),
  });

  constructor() {
    effect(() => {
      const t = this.trade();
      if (t && this.mode() === 'edit') {
        this.initialStrategyId = t.strategyId;
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
        this.initialStrategyId = null;
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
      .subscribe((strategyId) => {
        if (this.mode() !== 'edit' || this.isPatchingStrategy) {
          return;
        }

        if ((strategyId ?? null) === this.initialStrategyId) {
          return;
        }

        const confirmed = window.confirm(
          'Changing the strategy will update the strategy version to the current version. Continue?',
        );

        if (!confirmed) {
          this.isPatchingStrategy = true;
          this.form.controls.strategyId.setValue(this.initialStrategyId);
          this.isPatchingStrategy = false;
          return;
        }

        if (!strategyId) {
          this.form.controls.strategyVersionId.setValue(null);
          this.initialStrategyId = null;
          return;
        }

        this.strategiesApiService.get(strategyId).subscribe({
          next: (strategy) => {
            this.form.controls.strategyVersionId.setValue(
              strategy.currentVersion?.id ?? null,
            );
            this.initialStrategyId = strategyId;
          },
          error: () => {
            this.isPatchingStrategy = true;
            this.form.controls.strategyId.setValue(this.initialStrategyId);
            this.isPatchingStrategy = false;
          },
        });
      });
  }

  get isEditMode(): boolean {
    return this.mode() === 'edit';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const openedAt =
      raw.openedAt instanceof Date
        ? raw.openedAt.toISOString()
        : `${raw.openedAt}`;
    const closedAt =
      raw.closedAt instanceof Date
        ? raw.closedAt.toISOString()
        : raw.closedAt
          ? `${raw.closedAt}`
          : undefined;
    const tags = (raw.tags ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

    if (this.isEditMode) {
      const request: UpdateTradeRequest = {
        strategyId: raw.strategyId ?? undefined,
        strategyVersionId: raw.strategyVersionId ?? undefined,
        direction: raw.direction ?? 'Long',
        openedAt,
        closedAt,
        symbol: (raw.symbol ?? '').toUpperCase(),
        entryPrice: raw.entryPrice ?? 0,
        exitPrice: raw.exitPrice ?? undefined,
        quantity: raw.quantity ?? undefined,
        rMultiple: raw.rMultiple ?? undefined,
        pnl: raw.pnl ?? undefined,
        tags,
        notes: raw.notes ?? undefined,
        status: raw.status ?? 'Open',
      };
      this.save.emit(request);
      return;
    }

    const request: CreateTradeRequest = {
      accountId: raw.accountId ?? '',
      strategyId: raw.strategyId ?? undefined,
      strategyVersionId: raw.strategyVersionId ?? undefined,
      direction: raw.direction ?? 'Long',
      openedAt,
      closedAt,
      symbol: (raw.symbol ?? '').toUpperCase(),
      entryPrice: raw.entryPrice ?? 0,
      exitPrice: raw.exitPrice ?? undefined,
      quantity: raw.quantity ?? undefined,
      rMultiple: raw.rMultiple ?? undefined,
      pnl: raw.pnl ?? undefined,
      tags,
      notes: raw.notes ?? undefined,
      status: raw.status ?? 'Open',
    };
    this.save.emit(request);
  }

  onCancel(): void {
    this.formCancel.emit();
  }
}
