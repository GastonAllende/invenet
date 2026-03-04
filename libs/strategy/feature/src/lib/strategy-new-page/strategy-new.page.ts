import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { StrategiesStore } from '@invenet/strategy-data-access';
import type {
  CreateStrategyRequest,
  CreateStrategyVersionRequest,
} from '@invenet/strategy-data-access';
import { StrategyFormComponent } from '@invenet/strategy-ui';

@Component({
  selector: 'lib-strategy-new-page',
  standalone: true,
  imports: [CommonModule, ToastModule, StrategyFormComponent],
  providers: [MessageService],
  template: `
    <div class="strategy-shell entity-shell">
      <p-toast></p-toast>
      <section class="page-header entity-header">
        <h1 class="page-title entity-title">Create Strategy</h1>
        <p class="page-subtitle entity-subtitle">
          Define strategy metadata and your first ruleset.
        </p>
      </section>
      <lib-strategy-form
        [mode]="'create'"
        [isLoading]="isLoading()"
        (save)="onSave($event)"
        (formCancel)="onCancel()"
      ></lib-strategy-form>
    </div>
  `,
})
export class StrategyNewPage {
  private readonly store = inject(StrategiesStore);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  readonly isLoading = this.store.isLoading;
  readonly error = this.store.error;

  constructor() {
    effect(() => {
      const id = this.store.lastCreatedStrategyId();
      if (!id) return;
      this.store.clearLastCreatedStrategyId();
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Strategy created',
        life: 2500,
      });
      void this.router.navigate(['/strategies', id]);
    });

    effect(() => {
      const error = this.error();
      if (!error) return;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error,
        life: 5000,
      });
      this.store.clearError();
    });
  }

  onSave(payload: CreateStrategyRequest | CreateStrategyVersionRequest): void {
    this.store.createStrategy(payload as CreateStrategyRequest);
  }

  onCancel(): void {
    void this.router.navigateByUrl('/strategies');
  }
}
