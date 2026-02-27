# Feature Specification: Accounts UI Refactoring - Modal Pattern Alignment + Delete Functionality

**Feature Branch**: `003-align-accounts-design`  
**Created**: 20 February 2026  
**Status**: Draft  
**Input**: User description: "I want to refactor account and align the design with strategies page. The add and edit should be in a modal as it is in strategies. In we should have the same header, button and table as in the account page in strategies. Also add the functionality to delete account."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Create Account via Modal (Priority: P1)

Users need to create new trading accounts through a modal dialog interface that provides focused, non-disruptive account creation without navigating away from the accounts overview.

**Why this priority**: This is the core functionality change that establishes the new UI pattern. Without this, users cannot create accounts in the new design.

**Independent Test**: Can be fully tested by clicking the "New Account" button, filling the form in the modal, submitting, and verifying the account appears in the table without page navigation.

**Acceptance Scenarios**:

1. **Given** user is viewing the accounts list, **When** user clicks "New Account" button in the list header, **Then** a modal dialog opens with an empty account form
2. **Given** the create account modal is open, **When** user fills valid account details and clicks save, **Then** the modal closes, account is created, and accounts list refreshes showing the new account
3. **Given** the create account modal is open, **When** user clicks cancel or closes the modal, **Then** the modal closes without saving and the accounts list remains unchanged

---

### User Story 2 - Edit Account via Modal (Priority: P1)

Users need to modify existing account details through a modal dialog that provides the same focused editing experience as account creation.

**Why this priority**: Equal in importance to creation - users must be able to edit accounts using the same modal pattern for consistency.

**Independent Test**: Can be fully tested by clicking edit on any account, modifying values in the modal, saving, and verifying changes persist in the accounts table.

**Acceptance Scenarios**:

1. **Given** user is viewing the accounts list, **When** user clicks edit action on an account, **Then** a modal dialog opens pre-populated with that account's current details
2. **Given** the edit account modal is open with existing account data, **When** user modifies fields and clicks save, **Then** the modal closes, account is updated, and changes are reflected in the accounts list
3. **Given** the edit account modal is open, **When** user clicks cancel, **Then** the modal closes without applying changes and the account remains unchanged

---

### User Story 3 - Delete Account with Confirmation (Priority: P2)

Users need to permanently delete accounts they no longer need, with a confirmation step to prevent accidental deletion.

**Why this priority**: Critical for account lifecycle management. Users need the ability to remove accounts, but this is less frequent than create/edit operations.

**Independent Test**: Can be fully tested by clicking delete on an account, confirming the deletion prompt, and verifying the account is removed from the list.

**Acceptance Scenarios**:

1. **Given** user is viewing the accounts list, **When** user clicks delete action on an account, **Then** a confirmation dialog appears asking to confirm the deletion
2. **Given** the delete confirmation dialog is displayed, **When** user confirms the deletion, **Then** the dialog closes, the account is permanently deleted, and the accounts list refreshes without that account
3. **Given** the delete confirmation dialog is displayed, **When** user cancels the deletion, **Then** the dialog closes and the account remains in the list unchanged
4. **Given** user deletes an account, **When** the deletion is successful, **Then** a success message is displayed confirming the account was deleted

---

### User Story 4 - Continuous List Visibility (Priority: P3)

Users need to maintain visibility of their accounts list at all times, even when creating or editing accounts, to provide context and enable quick reference during form operations.

**Why this priority**: Enhances user experience by providing visual context but the feature is functional without it (users can still create/edit in the modal).

**Independent Test**: Can be tested by opening create/edit modal and verifying the accounts table remains visible in the background (though may be covered by modal overlay).

**Acceptance Scenarios**:

1. **Given** user is viewing the accounts list, **When** user opens create or edit modal, **Then** the accounts list remains rendered on the page (beneath the modal overlay)
2. **Given** user has the create or edit modal open, **When** user closes the modal, **Then** the accounts list is immediately visible without re-rendering or navigation

---

### User Story 5 - Unified Header and Action Placement (Priority: P4)

The accounts list should have a consistent header structure with the "New Account" button positioned within the list component header, matching the strategies page design pattern.

**Why this priority**: Nice-to-have for visual consistency. The feature works without perfect header alignment.

**Independent Test**: Visual inspection - verify "New Account" button appears in the account-list component header alongside the list title, matching the strategies list pattern.

**Acceptance Scenarios**:

1. **Given** user views the accounts page, **When** the page loads, **Then** the list header displays "Accounts" title and "New Account" button in the same row
2. **Given** user views both accounts and strategies pages, **When** comparing the headers, **Then** both follow the same visual pattern (title on left, action button on right)

---

### Edge Cases

- **What happens when user opens edit modal but account is already deleted/archived by another session?** The backend will return 404 Not Found, modal displays error toast and closes.
- **How does the system handle network errors during save while modal is open?** Modal remains open, error toast displays network error message, user can retry or cancel.
- **What happens if user has unsaved changes in the modal and tries to close it?** OUT OF SCOPE - no unsaved changes warning implemented in this feature (follows strategies page pattern).
- **How does the modal behave on mobile/smaller screens?** PrimeNG p-dialog handles responsive behavior automatically - modal will scale appropriately.
- **What happens when validation fails on form submission?** Modal remains open showing validation error messages within the form, user must fix errors or cancel.
- **What happens when user tries to delete an account that has associated trades or data?** Backend business logic handles cascade delete or rejection - frontend displays backend error message if delete fails.
- **How does the system handle network errors during delete operation?** Confirmation dialog closes, error toast displays network error message.
- **What happens if user clicks delete multiple times rapidly?** First click triggers confirmation dialog, subsequent clicks are ignored until dialog is dismissed (modal overlay blocks background interaction).
- **Should deleted accounts be soft-deleted or hard-deleted from the system?** Hard delete (permanent removal from database) - distinct from archive functionality which already provides soft delete via IsActive flag.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST display account creation form in a modal dialog instead of inline replacement of the accounts list
- **FR-002**: System MUST display account editing form in a modal dialog instead of inline replacement of the accounts list
- **FR-003**: System MUST keep the accounts list visible when user opens create or edit modal
- **FR-004**: System MUST move the "New Account" or "Create Account" button from the shell component to the account-list component header
- **FR-005**: Account-list component MUST emit a create event when "New Account" button is clicked
- **FR-006**: Modal dialog MUST display "Create Account" as header title when creating new account
- **FR-007**: Modal dialog MUST display "Edit Account" as header title when editing existing account
- **FR-008**: Modal dialog MUST be closable via close button, cancel button, or clicking outside the modal (with standard modal behavior)
- **FR-009**: System MUST pre-populate the form with existing account data when editing
- **FR-010**: System MUST clear/reset the form when opening for new account creation
- **FR-011**: System MUST close the modal automatically after successful save operation
- **FR-012**: System MUST refresh or update the accounts list after successful create or edit operation
- **FR-013**: System MUST maintain all existing account-list functionality (pagination, sorting, filtering, archive toggle)
- **FR-014**: System MUST maintain all existing account-form validation rules and behavior within the modal
- **FR-015**: Modal dialog MUST prevent background interaction while open (modal overlay behavior)
- **FR-016**: System MUST display a delete button for each account in the accounts list
- **FR-017**: System MUST display a confirmation dialog when user clicks delete on an account
- **FR-018**: Confirmation dialog MUST clearly identify which account is being deleted displaying message: "Are you sure you want to delete the account '[Account Name]'? This action cannot be undone."
- **FR-019**: System MUST permanently remove the account from the database (hard delete) when user confirms deletion
- **FR-020**: System MUST close the confirmation dialog without deleting when user cancels
- **FR-021**: System MUST refresh the accounts list after successful deletion to remove the deleted account
- **FR-022**: System MUST display a success notification after account is successfully deleted
- **FR-023**: System MUST handle delete errors gracefully and display appropriate error messages
- **FR-024**: System MUST keep the modal open and display validation error messages within the form when validation fails on submission

### Key Entities

- **Account**: Trading account entity with all existing attributes (name, broker, account type, base currency, starting balance, risk settings, active status)
- **Modal State**: UI state tracking whether create or edit modal is open and which account is being edited

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can create a new account by clicking one button and completing the form in a modal, without leaving the accounts page view
- **SC-002**: Users can edit any account by clicking the edit button and completing the form in a modal, with changes reflected immediately in the accounts table
- **SC-003**: The accounts list component remains rendered in the DOM when modal is open (verifiable via browser DevTools inspection)
- **SC-004**: Visual consistency achieved - accounts page header and button placement matches strategies page (same component structure: title left, action button right, identical table layout)
- **SC-005**: Modal form submission completes and closes within 2 seconds on successful save
- **SC-006**: Zero regression - all existing account management features (create, edit, archive, filtering, sorting, pagination) continue to work exactly as before
- **SC-007**: Users can delete an account with two clicks (delete button + confirm) and see immediate removal from the list
- **SC-008**: Delete confirmation dialog prevents accidental deletions by requiring explicit user confirmation

## Assumptions _(optional)_

- The existing account-form component is already fully functional and only needs to be relocated into a modal container
- PrimeNG dialog component (p-dialog) is already available in the project dependencies (used by strategies)
- PrimeNG confirm dialog component (p-confirmDialog) is already available in the project dependencies (used by strategies)
- The accounts-shell component state management (signals, store) can be adapted to control modal visibility instead of inline form mode
- Existing form validation, error handling, and submission logic will work identically when form is rendered inside a modal
- The "Show Archived" checkbox functionality in accounts list will be preserved in its current location
- Backend API DELETE endpoint will be implemented as part of this feature
- Account deletion will be permanent (hard delete) - distinct from archive (IsActive=false) which provides soft delete
- Accounts with associated trades or data can be deleted (business rules for cascading deletes or orphan handling are backend concerns)
- The modal width and styling can follow the same pattern as strategies modal (500px width, centered, non-resizable)
- The confirmation dialog styling and behavior can follow the same pattern as strategies delete confirmation
- Users are already familiar with modal-based forms and confirmation dialogs from the strategies page, so no additional user training or onboarding is needed

## Dependencies _(optional)_

- **PrimeNG Dialog Component**: Requires p-dialog component to be available and properly configured
- **PrimeNG Confirm Dialog Component**: Requires p-confirmDialog component for delete confirmations (used by strategies)
- **Existing Account Form Component**: Depends on `lib-invenet-account-form` component being reusable within modal context
- **Existing Account List Component**: Depends on `lib-account-list` component being able to emit create and delete events and accept button in header
- **Accounts Store**: Depends on accounts store supporting modal state management for create/edit operations and delete functionality

## Out of Scope _(optional)_

- Changes to account data models or backend API contracts (beyond adding delete capability)
- New account management features beyond the existing create/edit/archive/delete functionality
- Responsive design optimizations for mobile devices (though modal should work on mobile, optimizations are out of scope)
- Accessibility improvements beyond what PrimeNG dialog provides by default
- Performance optimizations for large account lists
- Bulk operations on multiple accounts (bulk delete, bulk archive, etc.)
- Keyboard shortcuts for opening/closing modals
- Animation or transition customizations for modal open/close
- User preference settings for modal behavior
- Undo functionality for deleted accounts
- Trash/recycle bin for recovering deleted accounts
- Unsaved changes confirmation when closing modal - user must explicitly save or cancel
