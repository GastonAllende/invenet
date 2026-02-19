import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { StrategiesStore } from '../../data-access/strategies.store';
import { StrategyListComponent } from '../../ui/strategy-list/strategy-list.component';
import { StrategyFormComponent } from '../../ui/strategy-form/strategy-form.component';
import type { GetStrategyResponse } from '../../data-access/models';

@Component({
  selector: 'lib-strategy-shell',
  imports: [
    CommonModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    StrategyListComponent,
    StrategyFormComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './strategy-shell.component.html',
  styleUrls: ['./strategy-shell.component.css'],
})
export class StrategyShellComponent {
  private readonly store = inject(StrategiesStore);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  // Store signals
  strategies = this.store.activeStrategies;
  isLoading = this.store.isLoading;
  error = this.store.error;

  // Local UI state
  showFormDialog = signal(false);
  selectedStrategy = signal<GetStrategyResponse | null>(null);

  constructor() {
    // Watch for errors and display toast messages
    effect(() => {
      const error = this.error();
      if (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error,
          life: 5000,
        });
        this.store.clearError();
      }
    });
  }

  onCreateStrategy(): void {
    this.selectedStrategy.set(null);
    this.showFormDialog.set(true);
  }

  onEditStrategy(strategy: GetStrategyResponse): void {
    this.selectedStrategy.set(strategy);
    this.showFormDialog.set(true);
  }

  onDeleteStrategy(strategyId: string): void {
    this.confirmationService.confirm({
      message:
        'Are you sure you want to delete this strategy? This action cannot be undone.',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.deleteStrategy(strategyId);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Strategy deleted successfully',
          life: 3000,
        });
      },
    });
  }

  onSaveStrategy(payload: { name: string; description?: string }): void {
    const selected = this.selectedStrategy();

    if (selected) {
      // Update existing strategy
      this.store.updateStrategy({ id: selected.id, ...payload });
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Strategy updated successfully',
        life: 3000,
      });
    } else {
      // Create new strategy
      this.store.createStrategy(payload);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Strategy created successfully',
        life: 3000,
      });
    }

    this.closeFormDialog();
  }

  onCancelForm(): void {
    this.closeFormDialog();
  }

  private closeFormDialog(): void {
    this.showFormDialog.set(false);
    this.selectedStrategy.set(null);
  }
}
