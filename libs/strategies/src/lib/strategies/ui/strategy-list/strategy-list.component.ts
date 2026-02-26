import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import type { StrategyListItem } from '../../data-access/models';

@Component({
  selector: 'lib-strategy-list',
  imports: [CommonModule, TableModule, ButtonModule, TagModule, TooltipModule],
  templateUrl: './strategy-list.component.html',
  styleUrls: ['./strategy-list.component.css'],
})
export class StrategyListComponent {
  strategies = input<StrategyListItem[]>([]);
  isLoading = input<boolean>(false);

  create = output<void>();
  view = output<string>();
  archive = output<string>();
  unarchive = output<string>();

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
