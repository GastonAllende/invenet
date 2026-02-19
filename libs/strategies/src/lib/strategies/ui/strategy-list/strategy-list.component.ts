import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import type { GetStrategyResponse } from '../../data-access/models';

@Component({
  selector: 'lib-strategy-list',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    ConfirmDialogModule,
  ],
  templateUrl: './strategy-list.component.html',
  styleUrls: ['./strategy-list.component.css'],
})
export class StrategyListComponent {
  // Inputs
  strategies = input<GetStrategyResponse[]>([]);
  isLoading = input<boolean>(false);
  showDeleted = input<boolean>(false);

  // Outputs
  edit = output<GetStrategyResponse>();
  delete = output<string>();
  create = output<void>();

  onEdit(strategy: GetStrategyResponse): void {
    this.edit.emit(strategy);
  }

  onDelete(strategyId: string): void {
    this.delete.emit(strategyId);
  }

  onCreate(): void {
    this.create.emit();
  }

  getStatusSeverity(isDeleted: boolean): 'success' | 'danger' {
    return isDeleted ? 'danger' : 'success';
  }

  getStatusLabel(isDeleted: boolean): string {
    return isDeleted ? 'Deleted' : 'Active';
  }
}
