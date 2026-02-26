import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import type { StrategyListItem } from '../../data-access/models';

@Component({
  selector: 'lib-strategy-list',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    CheckboxModule,
  ],
  templateUrl: './strategy-list.component.html',
  styleUrls: ['./strategy-list.component.css'],
})
export class StrategyListComponent {
  strategies = input<StrategyListItem[]>([]);
  isLoading = input<boolean>(false);
  includeArchived = input<boolean>(false);

  create = output<void>();
  view = output<string>();
  archive = output<string>();
  unarchive = output<string>();
  includeArchivedChange = output<boolean>();

  onIncludeArchivedChange(value: boolean): void {
    this.includeArchivedChange.emit(value);
  }

  onCreate(): void {
    this.create.emit();
  }

  onView(id: string): void {
    this.view.emit(id);
  }

  onArchive(id: string): void {
    this.archive.emit(id);
  }

  onUnarchive(id: string): void {
    this.unarchive.emit(id);
  }

  getStatusSeverity(isArchived: boolean): 'contrast' | 'success' {
    return isArchived ? 'contrast' : 'success';
  }

  getStatusLabel(isArchived: boolean): string {
    return isArchived ? 'ARCHIVED' : 'ACTIVE';
  }
}
