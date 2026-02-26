import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { Trade } from '../../../data-access/src';

@Component({
  selector: 'lib-trade-detail',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, CardModule],
  templateUrl: './trade-detail.component.html',
  styleUrl: './trade-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradeDetailComponent {
  trade = input<Trade | null>(null);
  edit = output<void>();
  archive = output<void>();
  unarchive = output<void>();
  back = output<void>();

  onEdit(): void {
    this.edit.emit();
  }

  onArchive(): void {
    this.archive.emit();
  }

  onUnarchive(): void {
    this.unarchive.emit();
  }

  onBack(): void {
    this.back.emit();
  }

  getStatusSeverity(status: string): 'success' | 'info' {
    return status === 'Closed' ? 'success' : 'info';
  }

  getDirectionSeverity(direction: string): 'success' | 'danger' {
    return direction === 'Long' ? 'success' : 'danger';
  }
}
