# Tasks: Brokerage Account Management

**Input**: Design documents from `/specs/002-brokerage-accounts/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/AccountsOpenAPI.yaml, quickstart.md

**Branch**: `002-brokerage-accounts`  
**Feature**: Brokerage Account CRUD with Risk Settings  
**Tech Stack**: ASP.NET Core (.NET 10) + Angular 21.1 + PostgreSQL

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Exact file paths included in descriptions

## Path Conventions

- **Backend**: `apps/Invenet.Api/Modules/Accounts/`
- **Frontend**: `libs/accounts/`
- **Tests**: `apps/Invenet.Test/` (backend), `libs/accounts/src/` (frontend)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Checkout feature branch `002-brokerage-accounts` and verify clean state
- [x] T002 [P] Create backend module directory structure at `apps/Invenet.Api/Modules/Accounts/` with subdirectories: API/, Domain/, Infrastructure/
- [x] T003 [P] Generate frontend library using Nx: `npx nx g @nx/angular:library accounts --directory=libs/accounts --importPath=@invenet/accounts`
- [x] T004 [P] Create frontend library subdirectories: `data-access/`, `ui/`, `feature/` under `libs/accounts/src/lib/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend Foundation

- [x] T005 [P] Create `Account` entity class at `apps/Invenet.Api/Modules/Accounts/Domain/Account.cs` with 13 properties (Id, UserId, Name, Broker, AccountType, BaseCurrency, StartDate, StartingBalance, Timezone, Notes, IsActive, CreatedAt, UpdatedAt)
- [x] T006 [P] Create `AccountRiskSettings` entity class at `apps/Invenet.Api/Modules/Accounts/Domain/AccountRiskSettings.cs` with 8 properties (Id, AccountId, RiskPerTradePct, MaxDailyLossPct, MaxWeeklyLossPct, EnforceLimits, CreatedAt, UpdatedAt)
- [x] T007 [P] Create `AccountConfiguration` EF Core configuration at `apps/Invenet.Api/Modules/Accounts/Infrastructure/Data/AccountConfiguration.cs` with schema "accounts", table mapping, indexes (ix_accounts_user_active, ix_accounts_user_created)
- [x] T008 [P] Create `AccountRiskSettingsConfiguration` EF Core configuration at `apps/Invenet.Api/Modules/Accounts/Infrastructure/Data/AccountRiskSettingsConfiguration.cs` with schema "accounts", 1:1 relationship, unique index (ix_account_risk_settings_account_id)
- [x] T009 Register entities in `apps/Invenet.Api/Data/ModularDbContext.cs`: add DbSet properties for Accounts and AccountRiskSettings, apply configurations in OnModelCreating
- [x] T010 Create EF Core migration using `dotnet ef migrations add AddAccountsModule --context ModularDbContext` from `apps/Invenet.Api/` directory
- [x] T011 Review generated migration file to verify: schema creation, tables (accounts, account_risk_settings), indexes, FK constraints
- [x] T012 Apply migration to database using `dotnet ef database update --context ModularDbContext`

### Frontend Foundation

- [x] T013 [P] Create TypeScript interfaces at `libs/accounts/data-access/src/lib/models/account.model.ts`: Account, AccountRiskSettings, CreateAccountRequest, UpdateAccountRequest, GetAccountResponse, ListAccountsResponse, RiskSettingsDto, AccountType enum
- [x] T014 [P] Create barrel export at `libs/accounts/data-access/src/lib/models/index.ts` exporting all interfaces
- [x] T015 Create `AccountsApiService` at `libs/accounts/data-access/src/lib/services/accounts-api.service.ts` with 5 methods: list(), get(), create(), update(), archive()
- [x] T016 Create `AccountsStore` using NgRx SignalStore at `libs/accounts/data-access/src/lib/store/accounts.store.ts` with: entities, computed (activeAccounts, archivedAccounts), rxMethods (loadAccounts, loadAccount, createAccount, updateAccount, archiveAccount), selectedAccountId state
- [x] T017 [P] Create barrel exports at `libs/accounts/data-access/src/index.ts` exporting models, service, and store
- [x] T018 [P] Update `libs/accounts/src/index.ts` to re-export data-access barrel

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create New Account (Priority: P1) 🎯 MVP

**Goal**: Allow traders to create a new brokerage account with basic details and risk settings

**Independent Test**: User can navigate to accounts page, click "Create Account", fill form with account name, broker, type, currency, start date, starting balance, timezone, and risk percentages, submit form, and see new account in the list

### Backend Implementation for US1

- [x] T019 [P] [US1] Create `CreateAccountRequest` DTO at `apps/Invenet.Api/Modules/Accounts/Features/CreateAccount/CreateAccountRequest.cs` with validation attributes and RiskSettingsDto nested property
- [x] T020 [P] [US1] Create `CreateAccountResponse` DTO at `apps/Invenet.Api/Modules/Accounts/Features/CreateAccount/CreateAccountResponse.cs` matching GetAccountResponse structure
- [x] T021 [P] [US1] Create `RiskSettingsDto` at `apps/Invenet.Api/Modules/Accounts/Features/CreateAccount/CreateAccountRequest.cs` with 4 required decimal properties (included in same file as CreateAccountRequest)
- [x] T022 [US1] Create `AccountsController` at `apps/Invenet.Api/Modules/Accounts/API/AccountsController.cs` with [Authorize] attribute, ModularDbContext injection, GetCurrentUserId() helper method
- [x] T023 [US1] Implement POST /api/accounts endpoint in `AccountsController`: accept CreateAccountRequest, validate input, create Account + AccountRiskSettings entities, set CreatedAt/UpdatedAt timestamps, set UserId from claims, save to DB, return 201 Created with CreateAccountResponse
- [x] T024 [US1] Add input validation to POST endpoint: validate starting balance > 0, validate percentage ranges (0-100), validate required fields, return 400 with validation errors on failure

### Frontend Implementation for US1

- [x] T025 [P] [US1] Create `AccountFormComponent` at `libs/accounts/src/lib/ui/account-form/account-form.component.ts` as standalone component with reactive form (FormGroup), inputs for account fields + risk settings, PrimeNG components (InputText, Dropdown, Calendar, InputNumber), real-time validation
- [x] T026 [P] [US1] Create `AccountFormComponent` template at `libs/accounts/src/lib/ui/account-form/account-form.component.html` with form fields: name, broker (dropdown with predefined list + Other), accountType (Cash/Margin/Prop/Demo dropdown), baseCurrency (dropdown with 10 major currencies), startDate (calendar), startingBalance (InputNumber), timezone (dropdown with 12 common timezones), notes (textarea), risk settings section (4 InputNumber fields for percentages + enforce limits checkbox)
- [x] T027 [P] [US1] Create `AccountFormComponent` styles at `libs/accounts/src/lib/ui/account-form/account-form.component.css` matching PrimeNG theme
- [x] T028 [P] [US1] Add form validation logic to AccountFormComponent: required validators for name/broker/type/currency/startDate/startingBalance, min/max validators for percentages (0-100), min validator for startingBalance (0.01)
- [x] T029 [P] [US1] Create barrel export at `libs/accounts/src/lib/ui/index.ts` exporting AccountFormComponent
- [x] T030 [US1] Create `AccountsShellComponent` at `libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.ts` with AccountsStore injection, createMode signal, showForm() method, handleCreate() method calling store.createAccount()
- [x] T031 [US1] Create `AccountsShellComponent` template at `libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.html` with "Create Account" button, conditional rendering of AccountFormComponent, form submit handler
- [x] T032 [US1] Routes already configured - path 'account' exists in `apps/invenet/src/app/app.routes.ts` with lazy loading of @invenet/accounts
- [x] T033 [US1] Updated `libs/accounts/src/index.ts` to export AccountsShellComponent as Accounts for lazy loading
- [x] T034 [US1] Route already exists in app.routes.ts - no changes needed
- [x] T035 [US1] Navigation menu already has "Account" item in `apps/invenet/src/app/layout/component/app.menu.ts` - no changes needed

**Checkpoint**: At this point, User Story 1 should be fully functional - users can create accounts with risk settings and see them saved to database

---

## Phase 4: User Story 2 - View Account List (Priority: P2)

**Goal**: Allow traders to view all their brokerage accounts in a table with filtering

**Independent Test**: User navigates to /accounts and sees list of all active accounts in a PrimeNG Table, can toggle "Show Archived" to include archived accounts, list shows: name, broker, type, currency, starting balance, timezone, is_active status

### Backend Implementation for US2

- [x] T036 [P] [US2] Create `GetAccountResponse` DTO at `apps/Invenet.Api/Modules/Accounts/Features/GetAccount/GetAccountResponse.cs` with all Account properties + nested AccountRiskSettingsResponse (reused from CreateAccount)
- [x] T037 [P] [US2] AccountRiskSettingsResponse already exists in CreateAccount feature - no separate file needed
- [x] T038 [P] [US2] Create `ListAccountsResponse` DTO at `apps/Invenet.Api/Modules/Accounts/Features/ListAccounts/ListAccountsResponse.cs` with accounts array (AccountListItem) and total count
- [x] T039 [US2] Implement GET /api/accounts endpoint in `AccountsController`: accept includeArchived query param (default false), filter by UserId from claims, optionally filter by IsActive, eager-load RiskSettings with .Include(), order by Name, project to AccountListItem list, return ListAccountsResponse with total count

### Frontend Implementation for US2

- [x] T040 [P] [US2] Create `AccountListComponent` at `libs/accounts/src/lib/ui/account-list/account-list.component.ts` as standalone component with accounts input, includeArchived input, includeArchivedChange output, accountSelected output, editClicked output, archiveClicked output
- [x] T041 [P] [US2] Create `AccountListComponent` template at `libs/accounts/src/lib/ui/account-list/account-list.component.html` with PrimeNG Table, columns: name, broker, accountType, baseCurrency, startingBalance (formatted currency), risk per trade %, is_active badge, actions column (Edit, Archive buttons)
- [x] T042 [P] [US2] Create `AccountListComponent` styles at `libs/accounts/src/lib/ui/account-list/account-list.component.css` with table styling, badge colors (green for active, gray for archived)
- [x] T043 [P] [US2] Add "Show Archived" checkbox to `AccountListComponent` template that emits includeArchived toggle event
- [x] T044 [P] [US2] Export AccountListComponent from `libs/accounts/src/lib/ui/index.ts`
- [x] T045 [US2] Update `AccountsShellComponent` template to include AccountListComponent in else block of createMode condition, bind accounts from store.entities(), handle includeArchived toggle calling store.loadAccounts()
- [x] T046 [US2] Update `AccountsShellComponent` to call store.loadAccounts(false) in ngOnInit to populate list on page load
- [x] T047 [US2] Loading spinner already exists in template showing while store.isLoading() is true

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can create accounts AND view them in a sortable/filterable table

---

## Phase 5: User Story 3 - Edit Existing Account (Priority: P3)

**Goal**: Allow traders to update account details and risk settings for existing accounts

**Independent Test**: User clicks "Edit" button on account in list, form pre-fills with existing values, user can modify any field except start_date and starting_balance (read-only), submit saves changes, list reflects updates

### Backend Implementation for US3

- [ ] T048 [P] [US3] Create `UpdateAccountRequest` DTO at `apps/Invenet.Api/Modules/Accounts/Domain/DTOs/UpdateAccountRequest.cs` with editable fields only (name, broker, accountType, baseCurrency, timezone, notes, riskSettings) - excluding UserId, StartDate, StartingBalance
- [ ] T049 [P] [US3] Create `UpdateAccountResponse` DTO at `apps/Invenet.Api/Modules/Accounts/Domain/DTOs/UpdateAccountResponse.cs` matching GetAccountResponse structure
- [ ] T050 [US3] Implement GET /api/accounts/{id} endpoint in `AccountsController`: validate id parameter is Guid, filter by id AND UserId (security), eager-load RiskSettings, return 404 if not found or user mismatch, return GetAccountResponse
- [ ] T051 [US3] Implement PUT /api/accounts/{id} endpoint in `AccountsController`: validate id, accept UpdateAccountRequest, find existing account by id AND UserId, return 404 if not found/mismatch, update allowed fields only (preserve UserId, StartDate, StartingBalance), update UpdatedAt timestamp, update RiskSettings if provided, save changes, return UpdateAccountResponse
- [ ] T052 [US3] Add validation to PUT endpoint: same validations as POST (percentages 0-100, required fields), return 400 on validation failure

### Frontend Implementation for US3

- [x] T053 [US3] Add editMode signal and selectedAccountId signal to `AccountsShellComponent`, add editAccount(id: string) method that sets editMode and selectedAccountId, loads account from store
- [x] T054 [US3] Update `AccountFormComponent` to accept optional `accountId` input, add mode input ('create' | 'edit'), in edit mode: load account from store by id, pre-fill form with account data, make startDate and startingBalance fields read-only
- [x] T055 [US3] Update `AccountFormComponent` submit handler to emit updateAccount event (with id) in edit mode vs createAccount event in create mode
- [x] T056 [US3] Update `AccountsShellComponent` to handle AccountFormComponent edit events, call store.updateAccount(id, data) when in edit mode
- [x] T057 [US3] Update `AccountListComponent` to emit `editClicked` event with account id when Edit button clicked
- [x] T058 [US3] Connect AccountListComponent editClicked event to AccountsShellComponent.editAccount() method
- [x] T059 [US3] Add "Cancel" button to AccountFormComponent that emits cancel event, handle in AccountsShellComponent to reset create/edit mode

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently - users can create, view, and edit accounts

---

## Phase 6: User Story 4 - Archive Account (Priority: P4)

**Goal**: Allow traders to soft-delete (archive) accounts they no longer actively use

**Independent Test**: User clicks "Archive" button on account in list, confirmation dialog appears, on confirm account disappears from active list but remains in database with is_active=false, can be viewed by enabling "Show Archived" filter

### Backend Implementation for US4

- [ ] T060 [US4] Implement POST /api/accounts/{id}/archive endpoint in `AccountsController`: validate id, find account by id AND UserId, return 404 if not found/mismatch, set IsActive = false, update UpdatedAt timestamp, save changes, return 200 with success message
- [ ] T061 [US4] Add archive authorization check: prevent archiving already archived accounts, return 400 if account.IsActive is already false

### Frontend Implementation for US4

- [ ] T062 [US4] Add confirmation dialog to `AccountListComponent` using PrimeNG ConfirmDialog, show when Archive button clicked asking "Are you sure you want to archive this account?"
- [ ] T063 [US4] Add archive(id: string) method to `AccountsShellComponent` that calls store.archiveAccount(id) and refreshes list after success
- [ ] T064 [US4] Connect AccountListComponent archiveClicked event to AccountsShellComponent.archive() method
- [ ] T065 [US4] Add success toast notification (PrimeNG Toast) in `AccountsShellComponent` after successful archive showing "Account archived successfully"
- [ ] T066 [US4] Update store.archiveAccount() rxMethod to optimistically remove account from entities or mark as inactive, refresh list from server on completion

**Checkpoint**: All user stories should now be independently functional - complete CRUD operations for brokerage accounts with risk settings

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T067 [P] Add error handling to all AccountsApiService methods: catch HTTP errors, map to user-friendly messages, propagate to store
- [x] T068 [P] Add error toast notifications to `AccountsShellComponent` for create/update/archive failures using PrimeNG Toast
- [x] T069 [P] Add loading states to buttons in AccountFormComponent (disable during submission) and AccountListComponent (disable actions during operations)
- [x] T070 [P] Update `README.md` in `libs/accounts/` with library overview, architecture diagram, usage examples
- [x] T071 [P] Add JSDoc comments to all public methods in AccountsApiService and AccountsStore
- [x] T072 [P] Add XML documentation comments to all public APIs in AccountsController and DTOs
- [x] T073 [P] Validate tasks.md against quickstart.md: ensure all steps from quickstart are covered in tasks
- [x] T074 Code cleanup: remove console.logs, format code with Prettier/ESLint (frontend) and dotnet format (backend)
- [x] T075 Run `npx nx lint accounts` to verify frontend code quality
- [x] T076 Run `dotnet build` from `apps/Invenet.Api/` to verify backend builds without errors
- [x] T077 Manual testing: complete one full workflow per user story following quickstart.md test scenarios
- [x] T078 [P] Update `AGENTS.md` to document new /accounts route and libs/accounts library structure
- [x] T079 [P] Update `apps/invenet/AGENT.md` with accounts library information and routing details

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order: P1 → P2 → P3 → P4
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - Create)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2 - List)**: Can start after Foundational (Phase 2) - Independent of US1 but complements it
- **User Story 3 (P3 - Edit)**: Can start after Foundational (Phase 2) - Reuses form from US1, list from US2, but independently testable
- **User Story 4 (P4 - Archive)**: Can start after Foundational (Phase 2) - Uses list from US2, but independently testable

**Critical Path**: Setup → Foundational → US1 (MVP) → US2 → US3 → US4 → Polish

### Within Each User Story

**Backend**:

- DTOs before controller (T019-T021 → T022-T024)
- Controller endpoints in any order after DTOs created

**Frontend**:

- Models first (already in Foundation)
- Components can be built in parallel (form, list marked [P])
- Store integration after components exist
- Routing last after components + store working

### Parallel Opportunities

**Phase 1 (Setup)**: T002, T003, T004 can run in parallel (different directories)

**Phase 2 (Foundation)**:

- Backend: T005, T006, T007, T008 can run in parallel (different files)
- Frontend: T013, T014 can run in parallel

**Phase 3 (US1)**:

- Backend: T019, T020, T021 can run in parallel (different DTOs)
- Frontend: T025, T026, T027, T028, T029 can build form in parallel with T030-T033 building shell

**Phase 4 (US2)**:

- Backend: T036, T037, T038 can run in parallel (different DTOs)
- Frontend: T040, T041, T042, T043, T044 can build list in parallel with shell updates

**Phase 5 (US3)**:

- Backend: T048, T049 can run in parallel
- Frontend: Form updates can proceed while shell updates happen

**Phase 7 (Polish)**: T067, T068, T069, T070, T071, T072, T074, T075, T076, T078, T079 can all run in parallel

---

## Parallel Example: Foundational Phase

```bash
# Backend entities (run in parallel):
Task T005: "Create Account entity at apps/Invenet.Api/Modules/Accounts/Domain/Account.cs"
Task T006: "Create AccountRiskSettings entity at apps/Invenet.Api/Modules/Accounts/Domain/AccountRiskSettings.cs"
Task T007: "Create AccountConfiguration at apps/Invenet.Api/Modules/Accounts/Infrastructure/Data/AccountConfiguration.cs"
Task T008: "Create AccountRiskSettingsConfiguration at apps/Invenet.Api/Modules/Accounts/Infrastructure/Data/AccountRiskSettingsConfiguration.cs"

# Frontend models (run in parallel):
Task T013: "Create TypeScript interfaces at libs/accounts/data-access/src/lib/models/account.model.ts"
Task T014: "Create barrel export at libs/accounts/data-access/src/lib/models/index.ts"
```

---

## Parallel Example: User Story 1 (Create Account)

```bash
# Backend DTOs (run in parallel):
Task T019: "Create CreateAccountRequest DTO"
Task T020: "Create CreateAccountResponse DTO"
Task T021: "Create RiskSettingsDto"

# Then controller (depends on DTOs):
Task T022: "Create AccountsController"
Task T023: "Implement POST /api/accounts"

# Frontend form (run in parallel):
Task T025: "Create AccountFormComponent TypeScript"
Task T026: "Create AccountFormComponent template"
Task T027: "Create AccountFormComponent styles"
Task T028: "Add form validation logic"
Task T029: "Create barrel export for form"

# Frontend shell (can run parallel with form):
Task T030: "Create AccountsShellComponent"
Task T031: "Create AccountsShellComponent template"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. **Week 1**: Complete Phase 1 (Setup) + Phase 2 (Foundational)
   - Backend: Entities, configurations, migration applied
   - Frontend: Models, service, store structure
   - **Checkpoint**: Foundation ready ✅

2. **Week 2**: Complete Phase 3 (User Story 1 - Create Account)
   - Backend: POST /accounts endpoint with validation
   - Frontend: Account creation form with risk settings
   - **Checkpoint**: MVP ready - can create accounts! ✅
   - **Demo**: Show stakeholders account creation flow

3. **STOP and VALIDATE**: Test US1 independently:
   - Create account with valid data → succeeds
   - Create account with invalid data → shows errors
   - Verify data in database tables
   - Check risk settings are saved correctly

### Incremental Delivery (Full Feature)

4. **Week 3**: Add Phase 4 (User Story 2 - View List)
   - Backend: GET /accounts endpoint
   - Frontend: Account list table with filtering
   - **Checkpoint**: Can create AND view accounts ✅
   - **Demo**: Show account management dashboard

5. **Week 4**: Add Phase 5 (User Story 3 - Edit)
   - Backend: GET /accounts/{id} + PUT /accounts/{id}
   - Frontend: Edit form (reuse creation form component)
   - **Checkpoint**: Can create, view, AND edit ✅

6. **Week 5**: Add Phase 6 (User Story 4 - Archive) + Phase 7 (Polish)
   - Backend: POST /accounts/{id}/archive
   - Frontend: Archive button + confirmation
   - Polish: Error handling, documentation, testing
   - **Checkpoint**: Complete CRUD feature ✅
   - **Final Demo**: Full account lifecycle

### Parallel Team Strategy

With 2 developers:

**Developer A (Backend)**:

- Week 1: T005-T012 (Foundation)
- Week 2: T019-T024 (US1 backend)
- Week 3: T036-T039 (US2 backend)
- Week 4: T048-T052 (US3 backend)
- Week 5: T060-T061 (US4 backend) + T072, T076 (polish)

**Developer B (Frontend)**:

- Week 1: T013-T018 (Foundation)
- Week 2: T025-T035 (US1 frontend)
- Week 3: T040-T047 (US2 frontend)
- Week 4: T053-T059 (US3 frontend)
- Week 5: T062-T066 (US4 frontend) + T067-T071, T073-T075, T077-T079 (polish)

**Integration Points**: End of each week, merge backend + frontend for that story, test together

---

## Task Count Summary

- **Phase 1 (Setup)**: 4 tasks
- **Phase 2 (Foundation)**: 14 tasks (Backend: 8, Frontend: 6)
- **Phase 3 (US1 - Create)**: 17 tasks (Backend: 6, Frontend: 11)
- **Phase 4 (US2 - List)**: 12 tasks (Backend: 4, Frontend: 8)
- **Phase 5 (US3 - Edit)**: 12 tasks (Backend: 5, Frontend: 7)
- **Phase 6 (US4 - Archive)**: 7 tasks (Backend: 2, Frontend: 5)
- **Phase 7 (Polish)**: 13 tasks

**Total**: 79 tasks

**Estimated Effort**:

- 1 developer, sequential: 6-7 weeks
- 2 developers, parallel: 3-4 weeks
- MVP only (Phase 1-3): 2-3 weeks

---

## Notes

- [P] tasks target different files and can run in parallel by different developers or in separate branches
- [Story] label maps each task to a specific user story (US1, US2, US3, US4) for traceability and independent delivery
- Each user story is independently completable and testable - you can ship US1 alone as MVP
- All file paths are absolute from repository root for clarity
- Backend follows Modular Monolith pattern established in 001-trade-strategy (Strategies module)
- Frontend mirrors libs/strategies structure for consistency
- Database uses lowercase table names with underscores (PostgreSQL convention)
- EF Core configurations include explicit schema ("accounts") and index names
- No tests included (tests not requested in feature specification)
- Validation rules match data-model.md specifications
- All endpoints require JWT authentication ([Authorize] attribute)
- Risk settings are always embedded in account responses (nested DTOs, not separate endpoints)
- Soft delete pattern: IsActive flag instead of hard delete
- Follow quickstart.md for detailed implementation guidance on each task
