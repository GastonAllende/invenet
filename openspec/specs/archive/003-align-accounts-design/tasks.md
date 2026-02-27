# Tasks: Accounts UI Refactoring - Modal Pattern Alignment + Delete

**Input**: Design documents from `/specs/003-align-accounts-design/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not explicitly requested in the specification - tasks focus on implementation only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Minimal setup - most infrastructure already exists

- [ ] T001 Verify PrimeNG DialogModule and ConfirmDialogModule are available in package.json
- [ ] T002 Review strategies page implementation as reference pattern in libs/strategies/src/lib/strategies/feature/strategy-shell/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core modal infrastructure that MUST be complete before user story work begins

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend Foundation

- [ ] T003 Create DeleteAccount feature folder structure in apps/api/Invenet.Api/Modules/Accounts/Features/DeleteAccount/

### Frontend Foundation - Shell Component Modal Setup

- [ ] T004 Add DialogModule import to accounts-shell component in libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.ts
- [ ] T005 Add ConfirmDialogModule import to accounts-shell component in libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.ts
- [ ] T006 Add ConfirmationService to providers array in accounts-shell component in libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.ts
- [ ] T007 Add showFormDialog signal in accounts-shell component in libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.ts
- [ ] T008 Add selectedAccount signal in accounts-shell component in libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.ts
- [ ] T009 Inject ConfirmationService in accounts-shell component in libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Stories 1 & 2 - Create and Edit Account via Modal (Priority: P1) 🎯 MVP

**Goal**: Enable users to create and edit accounts through modal dialogs instead of inline forms

**Independent Test**: Click "New Account" → modal opens with empty form → fill and save → modal closes and account appears in list. Click "Edit" on account → modal opens with pre-filled form → modify and save → modal closes with changes reflected.

### Frontend Implementation - Modal State Management

- [ ] T010 [US1] [US2] Remove createMode and editMode signals from accounts-shell component in libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.ts
- [ ] T011 [US1] [US2] Remove selectedAccountId signal from accounts-shell component in libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.ts
- [ ] T012 [US1] [US2] Add onCreateAccount method to accounts-shell component in libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.ts
- [ ] T013 [US1] [US2] Add onEditAccount method to accounts-shell component in libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.ts
- [ ] T014 [US1] [US2] Add onSaveAccount method to accounts-shell component in libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.ts
- [ ] T015 [US1] [US2] Add onCancelForm method to accounts-shell component in libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.ts

### Frontend Implementation - Shell Component Template

- [ ] T016 [US1] [US2] Remove header section with create button from accounts-shell template in libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.html
- [ ] T017 [US1] [US2] Remove conditional @if blocks for createMode and editMode from accounts-shell template in libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.html
- [ ] T018 [US1] [US2] Wrap account-form component in p-dialog in accounts-shell template in libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.html
- [ ] T018a [US1] [US2] Configure p-dialog modal title with dynamic binding ("Create Account" for create, "Edit Account" for edit) in libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.html
- [ ] T018b [US1] [US2] Configure p-dialog close behavior ([closable]="true", [modal]="true", [dismissableMask]="true") in libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.html
- [ ] T019 [US1] [US2] Add p-confirmDialog component to accounts-shell template in libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.html
- [ ] T020 [US1] [US2] Update event bindings on account-list component in accounts-shell template in libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.html

### Frontend Implementation - Shell Component Styles

- [ ] T021 [P] [US1] [US2] Remove inline form-specific styles from accounts-shell component in libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.css
- [ ] T022 [P] [US1] [US2] Add modal-specific styles if needed in accounts-shell component in libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.css

**Checkpoint**: Create and edit via modal should work - forms open in dialog, save closes modal, list updates

---

## Phase 4: User Story 3 - Delete Account with Confirmation (Priority: P2)

**Goal**: Users can permanently delete accounts with a confirmation dialog to prevent accidental deletion

**Independent Test**: Click delete on an account → confirmation dialog appears → click Yes → account is removed from list with success toast. Click delete → click No → dialog closes, account remains.

### Backend Implementation - Delete Endpoint

- [ ] T023 [P] [US3] Create DeleteAccountResponse DTO in apps/api/Invenet.Api/Modules/Accounts/Features/DeleteAccount/DeleteAccountResponse.cs
- [ ] T024 [US3] Add Delete method to AccountsController in apps/api/Invenet.Api/Modules/Accounts/API/AccountsController.cs
- [ ] T025 [US3] Add userId authorization check in Delete method in apps/api/Invenet.Api/Modules/Accounts/API/AccountsController.cs
- [ ] T026 [US3] Add database query and Remove call in Delete method in apps/api/Invenet.Api/Modules/Accounts/API/AccountsController.cs
- [ ] T027 [US3] Add logging for delete operation in AccountsController in apps/api/Invenet.Api/Modules/Accounts/API/AccountsController.cs
- [ ] T028 [US3] Verify cascade delete configuration for AccountRiskSettings in Entity Framework configuration

### Frontend Implementation - Delete API Integration

- [ ] T029 [P] [US3] Add deleteAccount method to AccountsApiService in libs/accounts/src/data-access/src/lib/services/accounts-api.service.ts
- [ ] T030 [US3] Add deleteAccount rxMethod to AccountsStore in libs/accounts/src/data-access/src/lib/store/accounts.store.ts
- [ ] T031 [US3] Add success toast notification in deleteAccount method in libs/accounts/src/data-access/src/lib/store/accounts.store.ts
- [ ] T032 [US3] Add error handling and error toast in deleteAccount method in libs/accounts/src/data-access/src/lib/store/accounts.store.ts

### Frontend Implementation - Delete UI

- [ ] T033 [P] [US3] Add delete @Output event emitter to account-list component in libs/accounts/src/lib/ui/account-list/account-list.component.ts
- [ ] T034 [P] [US3] Add onDelete method to account-list component in libs/accounts/src/lib/ui/account-list/account-list.component.ts
- [ ] T035 [US3] Add delete button to actions column in account-list template in libs/accounts/src/lib/ui/account-list/account-list.component.html
- [ ] T036 [US3] Add onDeleteAccount method to accounts-shell component in libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.ts
- [ ] T037 [US3] Implement confirmation dialog logic in onDeleteAccount method in libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.ts
- [ ] T038 [US3] Wire delete event from account-list to onDeleteAccount in accounts-shell template in libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.html

**Checkpoint**: Delete functionality complete - clicking delete shows confirmation, accepting removes account, canceling preserves it

---

## Phase 5: User Story 4 - Continuous List Visibility (Priority: P3)

**Goal**: Accounts list remains visible in the background when modals are open for context

**Independent Test**: Open create or edit modal → verify accounts table is still rendered in DOM behind modal overlay (use browser DevTools)

### Frontend Implementation - Visual Verification

- [ ] T039 [US4] Verify account-list component always renders in accounts-shell template in libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.html
- [ ] T040 [US4] Verify modal overlay doesn't replace list (modal is additive) in accounts-shell template structure
- [ ] T041 [P] [US4] Add CSS to ensure proper z-index layering in accounts-shell component in libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.css
- [ ] T041a [US4] Use browser DevTools to verify account-list element remains in DOM when modal is open (SC-003 verification)

**Checkpoint**: List visibility verified - background list remains in DOM when modal opens

---

## Phase 6: User Story 5 - Unified Header and Action Placement (Priority: P4)

**Goal**: "New Account" button moves to account-list component header, matching strategies page pattern

**Independent Test**: Visual inspection - accounts page header layout matches strategies page (title on left, button on right, both in list component)

### Frontend Implementation - Header Restructuring

- [ ] T042 [P] [US5] Add create @Output event emitter to account-list component in libs/accounts/src/lib/ui/account-list/account-list.component.ts
- [ ] T043 [P] [US5] Add onCreate method to account-list component in libs/accounts/src/lib/ui/account-list/account-list.component.ts
- [ ] T044 [US5] Add "New Account" button to list-header section in account-list template in libs/accounts/src/lib/ui/account-list/account-list.component.html
- [ ] T045 [US5] Update list-header styles to match strategies pattern in libs/accounts/src/lib/ui/account-list/account-list.component.css
- [ ] T046 [US5] Wire create event from account-list to onCreateAccount in accounts-shell template in libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.html
- [ ] T047 [US5] Verify header alignment matches strategies page visually

**Checkpoint**: Header alignment complete - layout matches strategies page, button placement consistent

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements and validation across all user stories

- [ ] T048 [P] Remove unused methods and state from accounts-shell component in libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.ts
- [ ] T049 [P] Update account-list component prop documentation in libs/accounts/src/lib/ui/account-list/account-list.component.ts
- [ ] T050 [P] Remove loading overlay if modal handles loading state in libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.html
- [ ] T051 [P] Verify all PrimeNG imports are used in accounts-shell component in libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.ts
- [ ] T052 Manually test all five user stories end-to-end per quickstart.md validation
- [ ] T053 Verify modal closes on successful create/edit operations
- [ ] T054 Verify modal remains open on validation errors (FR-024)
- [ ] T055 Verify delete confirmation closes on accept or reject
- [ ] T056 Verify error toasts appear for failed operations
- [ ] T057 Verify success toasts appear for successful operations
- [ ] T057a Measure and verify modal open/close performance (<200ms) using browser DevTools Performance tab
- [ ] T057b Measure and verify form submission time (<2s) from save click to modal close using browser DevTools Network tab
- [ ] T058 [P] Update README.md in libs/accounts/ if needed with modal pattern documentation
- [ ] T059 Code review against ANGULAR_BEST_PRACTICES.md and NGRX_SIGNALSTORE_GUIDE.md
- [ ] T060 Run frontend linting with npx nx lint accounts
- [ ] T061 Run backend linting/formatting with dotnet format

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories 1 & 2 (Phase 3)**: Depends on Foundational (Phase 2) completion
- **User Story 3 (Phase 4)**: Depends on Foundational (Phase 2) completion - Can run in parallel with Phase 3
- **User Story 4 (Phase 5)**: Depends on Phase 3 completion (modal implementation)
- **User Story 5 (Phase 6)**: Depends on Phase 3 completion (shell template changes)
- **Polish (Phase 7)**: Depends on Phases 3-6 completion

### User Story Dependencies

- **User Stories 1 & 2 (P1)**: Combined into Phase 3 - share modal infrastructure, naturally implemented together
- **User Story 3 (P2)**: Independent after Foundational - can proceed in parallel with US1/US2 if desired
- **User Story 4 (P3)**: Inherently satisfied by modal implementation (Phase 3) - just needs verification
- **User Story 5 (P4)**: Requires Phase 3 template changes - builds on modal pattern

### Within Each Phase

**Phase 2 (Foundational)**:

- Backend folder creation (T003) has no dependencies
- All shell component setup tasks (T004-T009) can run sequentially or in small parallel batches

**Phase 3 (US1 & US2)**:

- T010-T015: Component logic changes (sequential, same file)
- T016-T020: Template changes (sequential, same file)
- T021-T022: Style changes (can run in parallel, different concern)

**Phase 4 (US3)**:

- Backend tasks T023-T028: T023 parallel, T024-T027 sequential (same file), T028 verification parallel
- Frontend API tasks T029-T032: T029 parallel, T030-T032 sequential (same file)
- Frontend UI tasks T033-T038: T033-T034 parallel, T035 sequential to T033-T034, T036-T037 sequential, T038 template change

**Phase 5 (US4)**:

- All tasks (T039-T041) are verification/minor adjustments, mostly parallel

**Phase 6 (US5)**:

- T042-T043 parallel (component logic)
- T044-T045 sequential after T042-T043 (template and styles)
- T046-T047 sequential (integration and verification)

**Phase 7 (Polish)**:

- Most tasks are independent and can run in parallel
- T052-T057 are manual testing (sequential)
- T060-T061 linting can run in parallel

### Parallel Opportunities

**Across Phases** (if team capacity allows):

- Once Phase 2 is complete:
  - Phase 3 (US1 & US2) and Phase 4 (US3) can run in parallel
  - Different developers can work on modal implementation vs delete functionality simultaneously

**Within Phases**:

- Phase 2: Backend (T003) parallel with frontend setup (T004-T009)
- Phase 3: Style tasks (T021-T022) parallel with logic/template tasks
- Phase 4: API service (T029), component events (T033-T034) can run parallel to backend work
- Phase 7: Most cleanup tasks (T048-T051, T058-T061) can run in parallel

---

## Parallel Example: Phase 4 (User Story 3 - Delete)

```bash
# Backend and Frontend API can start simultaneously:
Developer A: "Create DeleteAccountResponse DTO" (T023)
Developer A: "Add Delete method to AccountsController" (T024-T027)
Developer B: "Add deleteAccount method to AccountsApiService" (T029)
Developer B: "Add deleteAccount rxMethod to AccountsStore" (T030-T032)

# After API ready, UI work:
Developer B: "Add delete @Output event emitter" (T033)
Developer B: "Add onDelete method" (T034)
Developer B: "Add delete button to template" (T035)
Developer A: "Add onDeleteAccount method to shell" (T036-T037)
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup (verify dependencies)
2. Complete Phase 2: Foundational (modal infrastructure)
3. Complete Phase 3: User Stories 1 & 2 (create/edit in modal)
4. **STOP and VALIDATE**: Test create and edit workflows independently
5. Deploy/demo if ready - this delivers the core modal pattern alignment

### Incremental Delivery

1. **Foundation** (Phases 1-2) → Modal infrastructure ready
2. **MVP** (Phase 3) → Create/Edit in modal → Test → Deploy/Demo ✅
3. **Delete** (Phase 4) → Add delete functionality → Test → Deploy/Demo ✅
4. **Visibility** (Phase 5) → Verify list visibility → Test (minimal) → Deploy/Demo ✅
5. **Header** (Phase 6) → Align header layout → Test → Deploy/Demo ✅
6. **Polish** (Phase 7) → Final cleanup and validation

Each increment adds value without breaking previous functionality.

### Parallel Team Strategy

With 2 developers after Foundation complete:

1. **Developer A**: Phase 3 (US1 & US2) - Modal implementation
2. **Developer B**: Phase 4 (US3) - Delete functionality (parallel to A)
3. Both developers: Phase 5 & 6 together (quick verification and header work)
4. Both developers: Phase 7 polish together

With 1 developer:

1. Sequential: Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7
2. Stop and validate after Phase 3 for early feedback

---

## Task Count Summary

- **Phase 1 (Setup)**: 2 tasks
- **Phase 2 (Foundational)**: 7 tasks
- **Phase 3 (US1 & US2 - P1)**: 15 tasks
- **Phase 4 (US3 - P2)**: 16 tasks
- **Phase 5 (US4 - P3)**: 4 tasks
- **Phase 6 (US5 - P4)**: 6 tasks
- **Phase 7 (Polish)**: 16 tasks

**Total**: 65 tasks

### Tasks per User Story

- **User Story 1 & 2 (Create/Edit Modal)**: 15 implementation tasks
- **User Story 3 (Delete)**: 16 implementation tasks
- **User Story 4 (List Visibility)**: 4 verification tasks
- **User Story 5 (Header Alignment)**: 6 implementation tasks
- **Setup & Foundation**: 9 tasks
- **Polish**: 16 tasks

### Parallel Opportunities Identified

- ~15 tasks marked [P] can run in parallel with other tasks
- Phase 3 and Phase 4 can run in parallel (15 + 16 = 31 tasks)
- Most polish tasks can run in parallel

### MVP Scope Recommendation

**Minimum Viable Product**: Phases 1-3 only (24 tasks)

- Delivers core modal pattern for create/edit
- Aligns with strategies page design
- Can be deployed independently
- Delete and header refinements can follow in subsequent releases

---

## Notes

- Tasks follow checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
- [P] indicates tasks that can run in parallel (different files, no dependencies)
- [Story] labels (US1, US2, US3, US4, US5) map tasks to user stories for traceability
- No test tasks included - tests not explicitly requested in specification
- Each user story phase is independently completable and deliverable
- File paths use absolute workspace paths from repository root
- Verify completion at each checkpoint before proceeding
- Commit frequently - after each task or logical group of related tasks
