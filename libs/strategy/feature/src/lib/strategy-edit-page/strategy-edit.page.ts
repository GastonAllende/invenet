import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { StrategiesStore } from '@invenet/strategy-data-access';
import type { CreateStrategyVersionRequest } from '@invenet/strategy-data-access';
import { StrategyFormComponent } from '@invenet/strategy-ui';

@Component({
  selector: 'lib-strategy-edit-page',
  standalone: true,
  imports: [CommonModule, ToastModule, MessageModule, StrategyFormComponent],
  providers: [MessageService],
  template: `
    <div class="flex flex-col gap-5">
      <p-toast></p-toast>
      <section class="bg-surface-card border border-surface-border rounded p-6">
        <h1 class="text-3xl font-semibold m-0 text-color">
          Edit Strategy (New Version)
        </h1>
        <p class="m-0 text-muted-color">
          This creates a new version and preserves previous ones.
        </p>
      </section>
      <section class="-mt-1">
        <p-message severity="warn" [closable]="false">
          Saving will create a new version. Previous versions remain unchanged.
        </p-message>
      </section>
      <lib-strategy-form
        [strategy]="selectedStrategy()"
        [mode]="'version'"
        [isLoading]="isLoading()"
        (save)="onSave($event)"
        (formCancel)="onCancel()"
      ></lib-strategy-form>
    </div>
  `,
})
export class StrategyEditPage {
  private readonly store = inject(StrategiesStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  private readonly strategyId = this.route.snapshot.paramMap.get('id');

  readonly selectedStrategy = this.store.selectedDetail;
  readonly isLoading = this.store.isLoading;
  readonly error = this.store.error;

  constructor() {
    if (this.strategyId) {
      this.store.loadStrategyDetail({ id: this.strategyId });
    }

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

  onSave(payload: CreateStrategyVersionRequest): void {
    if (!this.strategyId) return;
    this.store.createStrategyVersion({
      id: this.strategyId,
      payload,
    });
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'New version created',
      life: 2500,
    });
    void this.router.navigate(['/strategies', this.strategyId]);
  }

  onCancel(): void {
    if (this.strategyId) {
      void this.router.navigate(['/strategies', this.strategyId]);
      return;
    }
    void this.router.navigateByUrl('/strategies');
  }
}
