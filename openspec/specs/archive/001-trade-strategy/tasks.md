# Tasks: Trade Strategy Association

**Feature Branch**: `001-trade-strategy`  
**Date**: February 18, 2026  
**Input**: Design documents from `/specs/001-trade-strategy/`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/strategies-api.yaml](./contracts/strategies-api.yaml)

**Tests**: Tests are OPTIONAL for this feature. No test tasks are included in this implementation plan.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **- [ ]**: Markdown checkbox for task tracking
- **[ID]**: Sequential task ID (T001, T002, etc.)
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create feature branch `001-trade-strategy` from main branch
- [x] T002 [P] Create Strategies module directory structure in apps/api/Invenet.Api/Modules/Strategies/
- [x] T003 [P] Create strategies library in frontend workspace using Nx generator
- [x] T004 [P] Install required dependencies (verify PrimeNG, NgRx SignalStore, EF Core PostgreSQL provider)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database & Domain Models

- [x] T005 Create Strategy entity in apps/api/Invenet.Api/Modules/Strategies/Domain/Strategy.cs
- [x] T006 Create StrategyConfiguration for EF Core in apps/api/Invenet.Api/Modules/Strategies/Infrastructure/Data/StrategyConfiguration.cs
- [x] T007 Add StrategyId and Strategy navigation property to Trade entity in apps/api/Invenet.Api/Modules/Trades/Domain/Trade.cs
- [x] T008 Update TradeConfiguration to include Strategy relationship in apps/api/Invenet.Api/Modules/Trades/Infrastructure/Data/TradeConfiguration.cs
- [x] T009 Create database migration for strategies table and trade.strategy_id column using `dotnet ef migrations add AddStrategiesAndTradeStrategyRelation`
- [x] T010 Apply database migration using `dotnet ef database update`

### Backend Module Structure

- [x] T011 [P] Create StrategiesModule.cs in apps/api/Invenet.Api/Modules/Strategies/StrategiesModule.cs
- [x] T012 [P] Register StrategiesModule in Program.cs or module loader
- [x] T013 [P] Create base DTOs directory structure in apps/api/Invenet.Api/Modules/Strategies/Features/

### Frontend Foundation

- [x] T014 [P] Create Strategy model interface in libs/strategies/src/lib/strategies/data-access/models/strategy.model.ts
- [x] T015 [P] Create StrategiesService for HTTP API calls in libs/strategies/src/lib/strategies/data-access/strategies.service.ts
- [x] T016 [P] Create StrategiesStore using NgRx SignalStore in libs/strategies/src/lib/strategies/data-access/strategies.store.ts
- [x] T017 [P] Export public API from libs/strategies/src/index.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create and Manage Trading Strategies (Priority: P1) 🎯 MVP

**Goal**: Traders can create, view, edit, and delete their own custom trading strategies with name and optional description

**Independent Test**: Access strategy management UI, create new strategies, view strategy list, edit existing strategies, delete strategies, verify CRUD operations work correctly and duplicate names are prevented

### Backend Implementation for User Story 1

- [x] T018 [P] [US1] Create CreateStrategyRequest DTO in apps/api/Invenet.Api/Modules/Strategies/Features/CreateStrategy/CreateStrategyRequest.cs
- [x] T019 [P] [US1] Create CreateStrategyResponse DTO in apps/api/Invenet.Api/Modules/Strategies/Features/CreateStrategy/CreateStrategyResponse.cs
- [x] T020 [P] [US1] Create UpdateStrategyRequest DTO in apps/api/Invenet.Api/Modules/Strategies/Features/UpdateStrategy/UpdateStrategyRequest.cs
- [x] T021 [P] [US1] Create UpdateStrategyResponse DTO in apps/api/Invenet.Api/Modules/Strategies/Features/UpdateStrategy/UpdateStrategyResponse.cs
- [x] T022 [P] [US1] Create GetStrategyResponse DTO in apps/api/Invenet.Api/Modules/Strategies/Features/GetStrategy/GetStrategyResponse.cs
- [x] T023 [P] [US1] Create ListStrategiesResponse DTO in apps/api/Invenet.Api/Modules/Strategies/Features/ListStrategies/ListStrategiesResponse.cs
- [x] T024 [US1] Implement StrategiesController with all CRUD endpoints in apps/api/Invenet.Api/Modules/Strategies/API/StrategiesController.cs
- [x] T025 [US1] Add POST /api/strategies endpoint (create strategy) in StrategiesController
- [x] T026 [US1] Add GET /api/strategies endpoint (list strategies) in StrategiesController
- [x] T027 [US1] Add GET /api/strategies/{id} endpoint (get single strategy) in StrategiesController
- [x] T028 [US1] Add PUT /api/strategies/{id} endpoint (update strategy) in StrategiesController
- [x] T029 [US1] Add DELETE /api/strategies/{id} endpoint (soft delete strategy) in StrategiesController
- [x] T030 [US1] Implement name validation (required, max 200 chars, trim whitespace) in StrategiesController
- [x] T030a [US1] Implement description max length validation (2000 chars) in StrategiesController
- [x] T031 [US1] Implement duplicate name detection and 409 Conflict response in StrategiesController
- [x] T032 [US1] Implement account-scoped query filtering in all endpoints in StrategiesController
- [x] T033 [US1] Add error handling and ProblemDetails responses in StrategiesController

### Frontend Implementation for User Story 1

- [x] T034 [P] [US1] Create StrategyFormComponent using PrimeNG in libs/strategies/src/lib/strategies/ui/strategy-form/strategy-form.component.ts
- [x] T035 [P] [US1] Create StrategyFormComponent template with p-inputText and p-textarea in libs/strategies/src/lib/strategies/ui/strategy-form/strategy-form.component.html
- [x] T036 [P] [US1] Create StrategyListComponent using PrimeNG p-table in libs/strategies/src/lib/strategies/ui/strategy-list/strategy-list.component.ts
- [x] T037 [P] [US1] Create StrategyListComponent template in libs/strategies/src/lib/strategies/ui/strategy-list/strategy-list.component.html
- [x] T038 [US1] Create StrategyShellComponent (smart component) in libs/strategies/src/lib/strategies/feature/strategy-shell/strategy-shell.component.ts
- [x] T039 [US1] Implement create strategy logic with store integration in StrategyShellComponent
- [x] T040 [US1] Implement update strategy logic with store integration in StrategyShellComponent
- [x] T041 [US1] Implement delete strategy logic with store integration in StrategyShellComponent
- [x] T042 [US1] Implement load strategies list logic with store integration in StrategyShellComponent
- [x] T043 [US1] Add form validation (required name, max length) in StrategyFormComponent
- [x] T044 [US1] Add error handling and toast notifications using PrimeNG p-toast in StrategyShellComponent
- [x] T045 [US1] Create routes configuration in libs/strategies/src/lib/strategies/feature/strategies-routes.ts
- [x] T046 [US1] Integrate strategies routes into main app routing in apps/invenet/src/app/app.routes.ts

**Checkpoint**: At this point, User Story 1 should be fully functional - traders can create, view, edit, and delete strategies independently

---

## Phase 4: User Story 2 - Assign Strategy to New Trade (Priority: P2)

**Goal**: When creating a new trade, traders can select which trading strategy they used from their list of strategies

**Independent Test**: Create a trade and select a strategy from dropdown during trade creation, verify strategy appears in trade details. Requires at least one strategy from US1.

### Backend Implementation for User Story 2

- [ ] T047 [US2] Add StrategyId property to CreateTradeRequest DTO in apps/api/Invenet.Api/Modules/Trades/Features/CreateTrade/CreateTradeRequest.cs
- [ ] T048 [US2] Add StrategyId and StrategyName properties to TradeResponse DTO in apps/api/Invenet.Api/Modules/Trades/Features/CreateTrade/CreateTradeResponse.cs
- [ ] T049 [US2] Update CreateTrade handler to validate and save strategyId in apps/api/Invenet.Api/Modules/Trades/Features/CreateTrade/CreateTradeHandler.cs
- [ ] T050 [US2] Add strategy existence validation (404 if not found) in CreateTradeHandler
- [ ] T051 [US2] Add strategy account ownership validation (403 if wrong account) in CreateTradeHandler
- [ ] T052 [US2] Add deleted strategy validation in CreateTradeHandler (return 400 Bad Request with message "Cannot assign deleted strategy" if isDeleted=true)
- [ ] T053 [US2] Include strategy name in trade response for display in CreateTradeHandler

### Frontend Implementation for User Story 2

- [ ] T054 [P] [US2] Create StrategySelectorComponent (reusable dropdown) using PrimeNG p-dropdown with virtualScroll enabled in libs/strategies/src/lib/strategies/ui/strategy-selector/strategy-selector.component.ts
- [ ] T055 [P] [US2] Create StrategySelectorComponent template with virtualScroll support for 100+ strategies in libs/strategies/src/lib/strategies/ui/strategy-selector/strategy-selector.component.html
- [ ] T056 [US2] Add StrategyId field to Trade model in libs/trades/src/lib/trades/data-access/models/trade.model.ts
- [ ] T057 [US2] Add StrategyId field to CreateTradeDto in libs/trades/src/lib/trades/data-access/models/trade.model.ts
- [ ] T058 [US2] Import and use StrategySelectorComponent in TradeFormComponent in libs/trades/src/lib/trades/ui/trade-form/trade-form.component.ts
- [ ] T059 [US2] Add strategy selection field to trade form template in libs/trades/src/lib/trades/ui/trade-form/trade-form.component.html
- [ ] T060 [US2] Update trade form submission to include selected strategyId in libs/trades/src/lib/trades/ui/trade-form/trade-form.component.ts
- [ ] T061 [US2] Display strategy name in trade details view in libs/trades/src/lib/trades/ui/trade-detail/trade-detail.component.html

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - traders can create strategies and assign them to new trades

---

## Phase 5: User Story 3 - Add Strategy to Existing Trade Journal (Priority: P3)

**Goal**: Traders can add or update the strategy for trades they've already recorded, enabling retrospective organization

**Independent Test**: Edit an existing trade in the journal and add/change the strategy field, verify changes persist

### Backend Implementation for User Story 3

- [ ] T062 [US3] Add StrategyId property to UpdateTradeRequest DTO in apps/api/Invenet.Api/Modules/Trades/Features/UpdateTrade/UpdateTradeRequest.cs
- [ ] T063 [US3] Update UpdateTrade handler to validate and save strategyId in apps/api/Invenet.Api/Modules/Trades/Features/UpdateTrade/UpdateTradeHandler.cs
- [ ] T064 [US3] Add strategy existence validation (404 if not found) in UpdateTradeHandler
- [ ] T065 [US3] Add strategy account ownership validation (403 if wrong account) in UpdateTradeHandler
- [ ] T066 [US3] Add deleted strategy validation in UpdateTradeHandler (return 400 Bad Request with message "Cannot assign deleted strategy" if isDeleted=true)
- [ ] T067 [US3] Support null strategyId to remove strategy assignment in UpdateTradeHandler

### Frontend Implementation for User Story 3

- [ ] T068 [US3] Add StrategyId field to UpdateTradeDto in libs/trades/src/lib/trades/data-access/models/trade.model.ts
- [ ] T069 [US3] Ensure StrategySelectorComponent is included in edit trade form in libs/trades/src/lib/trades/ui/trade-form/trade-form.component.ts
- [ ] T070 [US3] Update trade form to populate existing strategy when editing in libs/trades/src/lib/trades/ui/trade-form/trade-form.component.ts
- [ ] T071 [US3] Update trade form submission to include strategyId when updating in libs/trades/src/lib/trades/ui/trade-form/trade-form.component.ts
- [ ] T072 [US3] Add "clear strategy" option in StrategySelectorComponent that sets strategyId to null in libs/strategies/src/lib/strategies/ui/strategy-selector/strategy-selector.component.ts

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work - traders can manage strategies, assign to new trades, and update existing trades

---

## Phase 6: User Story 4 - Filter and Analyze Trades by Strategy (Priority: P4)

**Goal**: Traders can filter their trade journal to view only trades using a specific strategy for performance analysis

**Independent Test**: Apply a strategy filter in the trade journal and verify only trades with that strategy are displayed

### Backend Implementation for User Story 4

- [ ] T073 [US4] Add strategyId query parameter to ListTrades endpoint in apps/api/Invenet.Api/Modules/Trades/API/TradesController.cs
- [ ] T074 [US4] Implement strategy filtering in ListTrades query in apps/api/Invenet.Api/Modules/Trades/Features/ListTrades/ListTradesHandler.cs
- [ ] T075 [US4] Include strategy name in trade list response for display in ListTradesHandler
- [ ] T076 [US4] Optimize query with proper eager loading of Strategy navigation property in ListTradesHandler

### Frontend Implementation for User Story 4

- [ ] T077 [P] [US4] Add strategy filter dropdown to TradeListComponent using StrategySelectorComponent in libs/trades/src/lib/trades/ui/trade-list/trade-list.component.ts
- [ ] T078 [P] [US4] Add strategy column to trade table in libs/trades/src/lib/trades/ui/trade-list/trade-list.component.html
- [ ] T079 [US4] Implement filter change handler to reload trades with strategyId parameter in TradeListComponent
- [ ] T080 [US4] Update TradesStore to support strategy filtering in libs/trades/src/lib/trades/data-access/trades.store.ts
- [ ] T081 [US4] Add "All Strategies" option to clear filter in TradeListComponent
- [ ] T082 [US4] Display strategy name in each trade row in trade table in libs/trades/src/lib/trades/ui/trade-list/trade-list.component.html

**Checkpoint**: All user stories should now be independently functional - complete strategy management and trade integration

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T083 [P] Add loading states and spinners for all async operations in StrategiesStore and TradesStore
- [ ] T084 [P] Add comprehensive error messages for all API failures in both modules
- [ ] T085 [P] Add confirmation dialog before deleting strategy using PrimeNG p-confirmDialog in StrategyShellComponent
- [ ] T086 [P] Add empty states for strategy list and trade list in respective components
- [ ] T087 [P] Verify all forms have proper validation messages in StrategyFormComponent and TradeFormComponent
- [ ] T088 [P] Add audit logging for strategy CRUD operations in backend StrategiesController
- [ ] T089 [P] Optimize database indexes for strategy queries in migration file
- [ ] T090 Code cleanup and refactoring across both frontend libraries and backend modules
- [ ] T091 Update API documentation (Swagger/OpenAPI) to reflect new strategy endpoints
- [ ] T092 Run through quickstart.md validation scenarios to verify complete implementation
- [ ] T093 Performance testing: verify strategy list loads in <500ms with 100+ strategies
- [ ] T093a Performance testing: verify trade filtering by strategy completes in <2s with 1000+ trades
- [ ] T093b Performance testing: verify strategy creation API responds in <200ms
- [ ] T094 Verify soft delete functionality for strategies maintains trade history integrity
- [ ] T094a Verify null strategyId is handled correctly in all trade endpoints (create, update, list, get)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Integrates with trades module, requires at least one strategy to test
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Similar to US2, integrates with trades module
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Requires trades with strategies to filter

### Within Each User Story

- Backend DTOs before controller implementation
- Controller endpoints can be implemented in parallel after DTOs exist
- Frontend models before services
- Services and store before UI components
- UI components can be implemented in parallel
- Smart components after presentational components
- Routing after all components exist
- Story complete before moving to next priority

### Parallel Opportunities

#### Phase 1 (Setup) - All tasks can run in parallel

- T002, T003, T004 can all run simultaneously

#### Phase 2 (Foundational) - Many parallel opportunities

- T005, T006 (Backend domain models) can run in parallel
- T014, T015, T016, T017 (Frontend foundation) can all run in parallel
- T011, T012, T013 (Backend module structure) can run in parallel
- Backend and Frontend work can proceed in parallel

#### Phase 3 (User Story 1) - Significant parallelism

Backend DTOs (T018-T023) can all run in parallel before controller implementation

Frontend UI components can run in parallel:

- T034, T035 (StrategyFormComponent)
- T036, T037 (StrategyListComponent)

#### Phase 4 (User Story 2) - Frontend parallelism

- T054, T055 (StrategySelectorComponent can be built independently)
- T056, T057 (Model updates can happen in parallel)

#### Phase 5 (User Story 3) - Limited parallelism

- Most tasks are sequential modifications to existing components

#### Phase 6 (User Story 4) - Some parallelism

- T077, T078 (UI updates) can run in parallel

#### Phase 7 (Polish) - High parallelism

- T083, T084, T085, T086, T087, T088, T089 can all run in parallel
- Different developers can tackle different polish tasks simultaneously

---

## Parallel Example: User Story 1

```bash
# Launch all Backend DTOs together:
Task: "Create CreateStrategyRequest DTO in apps/api/Invenet.Api/Modules/Strategies/Features/CreateStrategy/CreateStrategyRequest.cs"
Task: "Create CreateStrategyResponse DTO in apps/api/Invenet.Api/Modules/Strategies/Features/CreateStrategy/CreateStrategyResponse.cs"
Task: "Create UpdateStrategyRequest DTO in apps/api/Invenet.Api/Modules/Strategies/Features/UpdateStrategy/UpdateStrategyRequest.cs"
Task: "Create UpdateStrategyResponse DTO in apps/api/Invenet.Api/Modules/Strategies/Features/UpdateStrategy/UpdateStrategyResponse.cs"
Task: "Create GetStrategyResponse DTO in apps/api/Invenet.Api/Modules/Strategies/Features/GetStrategy/GetStrategyResponse.cs"
Task: "Create ListStrategiesResponse DTO in apps/api/Invenet.Api/Modules/Strategies/Features/ListStrategies/ListStrategiesResponse.cs"

# After DTOs complete, launch controller endpoints together:
Task: "Add POST /api/strategies endpoint (create) in StrategiesController"
Task: "Add GET /api/strategies endpoint (list) in StrategiesController"
Task: "Add GET /api/strategies/{id} endpoint (get) in StrategiesController"
Task: "Add PUT /api/strategies/{id} endpoint (update) in StrategiesController"
Task: "Add DELETE /api/strategies/{id} endpoint (delete) in StrategiesController"

# Launch UI components together:
Task: "Create StrategyFormComponent in libs/strategies/.../strategy-form/strategy-form.component.ts"
Task: "Create StrategyListComponent in libs/strategies/.../strategy-list/strategy-list.component.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (~15 minutes)
2. Complete Phase 2: Foundational (~60 minutes) - CRITICAL blocking phase
3. Complete Phase 3: User Story 1 (~90 minutes)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo strategy management feature

**Total MVP time**: ~2.5-3 hours

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (~75 minutes)
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!) (~90 minutes)
3. Add User Story 2 → Test independently → Deploy/Demo (~45 minutes)
4. Add User Story 3 → Test independently → Deploy/Demo (~30 minutes)
5. Add User Story 4 → Test independently → Deploy/Demo (~30 minutes)
6. Polish phase → Complete feature (~30 minutes)

**Total full feature time**: ~5 hours (as estimated in quickstart.md)

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (~75 minutes)
2. Once Foundational is done:
   - Developer A: User Story 1 (Backend focus)
   - Developer B: User Story 1 (Frontend focus)
   - Run in parallel, integrate when both complete
3. After US1 complete:
   - Developer A: User Story 2 & 3 (Trade integration backend)
   - Developer B: User Story 4 (Filtering frontend)
4. Polish tasks distributed across team

**Parallel team time**: ~3-3.5 hours (40% faster)

---

## Summary

- **Total Tasks**: 98 tasks across 7 phases (4 tasks added for validation and performance requirements)
- **MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1) = 47 tasks
- **User Stories**: 4 user stories (P1-P4) mapped to dedicated phases
- **Parallel Opportunities**:
  - Phase 1: 3 parallel tasks
  - Phase 2: 13 parallel tasks
  - Phase 3 (US1): 10 parallel tasks
  - Phase 4 (US2): 4 parallel tasks
  - Phase 7 (Polish): 9 parallel tasks
  - **Total parallelizable**: ~39 tasks (40%)
- **Critical Path**: Setup → Foundational → User Stories → Polish
- **Backend**: 39 tasks (40%)
- **Frontend**: 45 tasks (46%)
- **Shared/Polish**: 14 tasks (14%)
- **Estimated Time (Single Developer)**: ~5.5 hours
- **Estimated Time (Parallel Team)**: ~3.5-4 hours

---

## Notes

- All tasks follow strict checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`
- Each user story is independently completable and testable
- Strategy selector component implements virtual scrolling for 100+ strategies
- Soft delete ensures historical trade data integrity
- Deleted strategies cannot be assigned to trades (400 Bad Request validation)
- Account-scoped data enforced at both API and database levels
- Performance tests validate all technical success criteria (<500ms list, <2s filter, <200ms create)
- Manual testing required for user experience metrics (workflow timing, adoption rates)
- Frontend uses PrimeNG components consistently with virtual scrolling support
- Backend follows modular monolith pattern
- Database migration handles both new table and relationship
