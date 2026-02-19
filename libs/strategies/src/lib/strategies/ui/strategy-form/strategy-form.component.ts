import {
  Component,
  input,
  output,
  effect,
  inject,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import type { GetStrategyResponse } from '../../data-access/models';

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
export class StrategyFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  // Inputs
  strategy = input<GetStrategyResponse | null>(null);
  isLoading = input<boolean>(false);

  // Outputs
  save = output<{ name: string; description?: string }>();
  formCancel = output<void>();

  strategyForm!: FormGroup;

  constructor() {
    // Update form when strategy input changes
    effect(() => {
      const strategy = this.strategy();
      if (strategy && this.strategyForm) {
        this.strategyForm.patchValue({
          name: strategy.name,
          description: strategy.description || '',
        });
      }
    });
  }

  ngOnInit(): void {
    this.strategyForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(200),
          Validators.pattern(/^[a-zA-Z0-9 _-]+$/),
        ],
      ],
      description: ['', [Validators.maxLength(2000)]],
    });
  }

  onSubmit(): void {
    if (this.strategyForm.valid) {
      const value = this.strategyForm.value;
      this.save.emit({
        name: value.name.trim(),
        description: value.description?.trim() || undefined,
      });
    }
  }

  onCancel(): void {
    this.formCancel.emit();
    this.strategyForm.reset();
  }

  get nameControl() {
    return this.strategyForm.get('name');
  }

  get descriptionControl() {
    return this.strategyForm.get('description');
  }

  get isEditMode(): boolean {
    return this.strategy() !== null;
  }
}
