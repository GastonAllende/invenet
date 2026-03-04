import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { StrategiesStore } from '@invenet/strategy-data-access';
import { StrategyListComponent } from '@invenet/strategy-ui';

@Component({
  selector: 'lib-strategy-list-page',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    ConfirmDialogModule,
    StrategyListComponent,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="strategy-shell entity-shell">
      <p-toast></p-toast>
      <p-confirmDialog></p-confirmDialog>
      <lib-strategy-list
        [strategies]="strategies()"
        [isLoading]="isLoading()"
        [includeArchived]="includeArchived()"
        (includeArchivedChange)="onIncludeArchivedChange($event)"
        (create)="onCreateStrategy()"
        (view)="onViewStrategy($event)"
        (archive)="onArchiveStrategy($event)"
        (unarchive)="onUnarchiveStrategy($event)"
      ></lib-strategy-list>
    </div>
  `,
})
export class StrategyListPage {
  private readonly store = inject(StrategiesStore);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly strategies = this.store.entities;
  readonly isLoading = this.store.isLoading;
  readonly error = this.store.error;
  readonly includeArchived = signal(false);

  constructor() {
    this.store.loadStrategies({ includeArchived: false });

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

  onIncludeArchivedChange(value: boolean): void {
    this.includeArchived.set(value);
    this.store.loadStrategies({ includeArchived: value });
  }

  onCreateStrategy(): void {
    void this.router.navigateByUrl('/strategies/new');
  }

  onViewStrategy(id: string): void {
    void this.router.navigate(['/strategies', id]);
  }

  onArchiveStrategy(id: string): void {
    this.confirmationService.confirm({
      header: 'Archive Strategy',
      message:
        'Archive this strategy? You will not be able to create new versions while archived.',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.store.archiveStrategy(id);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Strategy archived',
          life: 2500,
        });
      },
    });
  }

  onUnarchiveStrategy(id: string): void {
    this.confirmationService.confirm({
      header: 'Unarchive Strategy',
      message: 'Unarchive this strategy?',
      icon: 'pi pi-info-circle',
      accept: () => {
        this.store.unarchiveStrategy(id);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Strategy unarchived',
          life: 2500,
        });
      },
    });
  }
}
