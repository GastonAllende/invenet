import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { GetAccountResponse } from '../../../data-access/src/lib/models/account.model';

/**
 * Component for displaying list of accounts
 */
@Component({
  selector: 'lib-account-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    CheckboxModule,
    TooltipModule,
  ],
  templateUrl: './account-list.component.html',
  styleUrl: './account-list.component.css',
})
export class AccountListComponent {
  accounts = input.required<GetAccountResponse[]>();
  activeAccountId = input<string | null>(null);
  includeArchived = input<boolean>(false);
  isLoading = input<boolean>(false);

  includeArchivedChange = output<boolean>();
  accountSelected = output<string>();
  create = output<void>();
  viewClicked = output<string>();
  setActiveClicked = output<string>();
  archiveClicked = output<string>();
  unarchiveClicked = output<string>();

  onIncludeArchivedChange(value: boolean): void {
    this.includeArchivedChange.emit(value);
  }

  onCreate(): void {
    this.create.emit();
  }

  onView(id: string): void {
    this.viewClicked.emit(id);
  }

  onSetActive(id: string): void {
    this.setActiveClicked.emit(id);
  }

  onArchive(id: string): void {
    this.archiveClicked.emit(id);
  }

  onUnarchive(id: string): void {
    this.unarchiveClicked.emit(id);
  }

  onRowSelect(account: GetAccountResponse): void {
    this.accountSelected.emit(account.id);
  }

  getSeverity(isActive: boolean): 'success' | 'secondary' {
    return isActive ? 'success' : 'secondary';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'ACTIVE' : 'ARCHIVED';
  }

  isActiveAccount(accountId: string): boolean {
    return this.activeAccountId() === accountId;
  }
}
