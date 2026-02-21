import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
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
  ],
  templateUrl: './account-list.component.html',
  styleUrl: './account-list.component.css',
})
export class AccountListComponent {
  accounts = input.required<GetAccountResponse[]>();
  includeArchived = input<boolean>(false);
  isLoading = input<boolean>(false);

  includeArchivedChange = output<boolean>();
  accountSelected = output<string>();
  create = output<void>();
  editClicked = output<string>();
  delete = output<string>();
  archiveClicked = output<string>();

  onIncludeArchivedChange(value: boolean): void {
    this.includeArchivedChange.emit(value);
  }

  onCreate(): void {
    this.create.emit();
  }

  onEdit(id: string): void {
    this.editClicked.emit(id);
  }

  onDelete(id: string): void {
    this.delete.emit(id);
  }

  onArchive(id: string): void {
    this.archiveClicked.emit(id);
  }

  onRowSelect(account: GetAccountResponse): void {
    this.accountSelected.emit(account.id);
  }

  getSeverity(isActive: boolean): 'success' | 'secondary' {
    return isActive ? 'success' : 'secondary';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Active' : 'Archived';
  }
}
