import { Component, effect, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import type {
  CreateStrategyRequest,
  CreateStrategyVersionRequest,
  GetStrategyResponse,
} from '../../data-access/models';

@Component({
  selector: 'lib-strategy-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
  ],
  templateUrl: './strategy-form.component.html',
  styleUrls: ['./strategy-form.component.css'],
})
export class StrategyFormComponent {
  private readonly fb = inject(FormBuilder);

  strategy = input<GetStrategyResponse | null>(null);
  mode = input<'create' | 'version'>('create');
  isLoading = input<boolean>(false);

  save = output<CreateStrategyRequest | CreateStrategyVersionRequest>();
  formCancel = output<void>();

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    market: ['', [Validators.maxLength(100)]],
    defaultTimeframe: ['', [Validators.maxLength(50)]],
    timeframe: ['', [Validators.maxLength(50)]],
    entryRules: ['', [Validators.required]],
    exitRules: ['', [Validators.required]],
    riskRules: ['', [Validators.required]],
    notes: [''],
  });

  constructor() {
    effect(() => {
      const strategy = this.strategy();
      if (!strategy) {
        return;
      }

      this.form.patchValue({
        name: strategy.name,
        market: strategy.market ?? '',
        defaultTimeframe: strategy.defaultTimeframe ?? '',
        timeframe: strategy.currentVersion?.timeframe ?? '',
        entryRules: strategy.currentVersion?.entryRules ?? '',
        exitRules: strategy.currentVersion?.exitRules ?? '',
        riskRules: strategy.currentVersion?.riskRules ?? '',
        notes: strategy.currentVersion?.notes ?? '',
      });
    });

    effect(() => {
      const isVersionMode = this.mode() === 'version';
      const metadataControls = [
        this.form.controls.name,
        this.form.controls.market,
        this.form.controls.defaultTimeframe,
      ];

      if (isVersionMode) {
        metadataControls.forEach((control) =>
          control.disable({ emitEvent: false }),
        );
        return;
      }

      metadataControls.forEach((control) => control.enable({ emitEvent: false }));
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    if (this.mode() === 'create') {
      this.save.emit({
        name: (value.name ?? '').trim(),
        market: value.market?.trim() || undefined,
        defaultTimeframe: value.defaultTimeframe?.trim() || undefined,
        timeframe: value.timeframe?.trim() || undefined,
        entryRules: (value.entryRules ?? '').trim(),
        exitRules: (value.exitRules ?? '').trim(),
        riskRules: (value.riskRules ?? '').trim(),
        notes: value.notes?.trim() || undefined,
      });
      return;
    }

    this.save.emit({
      timeframe: value.timeframe?.trim() || undefined,
      entryRules: (value.entryRules ?? '').trim(),
      exitRules: (value.exitRules ?? '').trim(),
      riskRules: (value.riskRules ?? '').trim(),
      notes: value.notes?.trim() || undefined,
    });
  }

  onCancel(): void {
    this.formCancel.emit();
  }
}
