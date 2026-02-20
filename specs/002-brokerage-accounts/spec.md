# Feature Specification: Brokerage Account Management

**Feature Branch**: `002-brokerage-accounts`  
**Created**: 20 February 2026  
**Status**: Ready for Implementation  
**Input**: User request for brokerage account CRUD with risk settings

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Create New Account (Priority: P1) 🎯 MVP

Allow traders to create a new brokerage account with basic details and risk settings. This is the foundational capability that enables all other account management features.

**Why this priority**: Without the ability to create accounts, the entire feature is non-functional. This is the minimum viable product that delivers immediate value - traders can start tracking their brokerage accounts.

**Independent Test**: User can navigate to accounts page, click "Create Account", fill form with account name, broker, type, currency, start date, starting balance, timezone, and risk percentages, submit form, and see new account in the list.

**Acceptance Scenarios**:

1. **Given** user is authenticated and on the accounts page, **When** user clicks "Create Account" button, **Then** a form appears with all required fields (name, broker, account type, currency, start date, starting balance, timezone) and risk settings section
2. **Given** user fills all required fields with valid data, **When** user submits the form, **Then** account is created in database with IsActive=true and user sees success message
3. **Given** user submits form with invalid data (e.g., negative balance, percentage > 100), **When** validation runs, **Then** user sees specific error messages and form is not submitted
4. **Given** user fills starting balance and risk percentages, **When** form validates, **Then** balance must be > 0 and percentages must be 0-100 range

---

### User Story 2 - View Account List (Priority: P2)

Allow traders to view all their brokerage accounts in a sortable/filterable table. This provides visibility into existing accounts and serves as navigation to edit/archive actions.

**Why this priority**: Once accounts can be created (US1), users need to view them. This is the second most critical feature as it enables account discovery and management.

**Independent Test**: User navigates to /accounts and sees list of all active accounts in a PrimeNG Table, can toggle "Show Archived" to include archived accounts, list shows: name, broker, type, currency, starting balance, timezone, is_active status.

**Acceptance Scenarios**:

1. **Given** user has created multiple accounts, **When** user navigates to /accounts, **Then** user sees all active accounts (IsActive=true) in a table sorted by name
2. **Given** user is viewing account list, **When** user toggles "Show Archived" checkbox, **Then** archived accounts (IsActive=false) appear in the list with gray badge
3. **Given** user views account list, **When** accounts are displayed, **Then** each row shows name, broker, accountType, baseCurrency, startingBalance (formatted as currency), timezone, risk per trade %, and is_active badge
4. **Given** user has no accounts yet, **When** user navigates to /accounts, **Then** user sees empty state message with "Create Account" button

---

### User Story 3 - Edit Existing Account (Priority: P3)

Allow traders to update account details and risk settings for existing accounts. Note: Start date and starting balance are immutable once set.

**Why this priority**: After creating and viewing accounts, users need to update details (e.g., change broker name, adjust risk percentages). Lower priority than creation/viewing because accounts can function without edits.

**Independent Test**: User clicks "Edit" button on account in list, form pre-fills with existing values, user can modify any field except start_date and starting_balance (read-only), submit saves changes, list reflects updates.

**Acceptance Scenarios**:

1. **Given** user is viewing account list, **When** user clicks "Edit" button on an account, **Then** form appears pre-filled with current account values
2. **Given** user is editing an account, **When** user modifies allowed fields (name, broker, type, currency, timezone, notes, risk settings), **Then** changes are saved to database and UpdatedAt timestamp is updated
3. **Given** user is editing an account, **When** user attempts to view start_date and starting_balance fields, **Then** fields are displayed as read-only (cannot be modified)
4. **Given** user edits account and clicks Cancel, **When** navigation occurs, **Then** no changes are saved and user returns to account list

---

### User Story 4 - Archive Account (Priority: P4)

Allow traders to soft-delete (archive) accounts they no longer actively use. Archived accounts are hidden by default but remain in database for historical records.

**Why this priority**: Lowest priority as it's a cleanup feature. Users can work with accounts without archiving capability, though it improves UX over time.

**Independent Test**: User clicks "Archive" button on account in list, confirmation dialog appears, on confirm account disappears from active list but remains in database with is_active=false, can be viewed by enabling "Show Archived" filter.

**Acceptance Scenarios**:

1. **Given** user is viewing an active account in the list, **When** user clicks "Archive" button, **Then** confirmation dialog appears asking "Are you sure you want to archive this account?"
2. **Given** confirmation dialog is displayed, **When** user confirms archival, **Then** account IsActive is set to false, account disappears from default list, and success toast appears
3. **Given** user has archived accounts, **When** user toggles "Show Archived" filter, **Then** archived accounts appear with gray "Archived" badge
4. **Given** user attempts to archive already-archived account, **When** request is sent, **Then** system returns 400 error indicating account is already archived

---

### Edge Cases

- What happens when user creates account with broker "Other" but provides no custom broker name?
- How does system handle concurrent edits (two users editing same account simultaneously)?
- What happens when user sets MaxDailyLossPct < RiskPerTradePct (violates recommended business rule)?
- How does system handle invalid timezone strings not in IANA database?
- What happens when user tries to create account with StartDate in the future?
- How does system handle currency codes not in predefined list (USD, EUR, SEK, GBP, JPY, CHF, AUD, CAD, NOK, DKK)?
- What happens when user archives account that has associated trades (not in current scope but future consideration)?
- How does system handle timezone conversions when displaying dates across different user timezones?

## Requirements _(mandatory)_

### Functional Requirements

#### Account Management

- **FR-001**: System MUST allow authenticated users to create brokerage accounts with required fields: name (max 200 chars), broker (max 100 chars), account type (Cash/Margin/Prop/Demo), base currency (3-char ISO code), start date, starting balance (> 0), and timezone (IANA format)
- **FR-002**: System MUST create associated AccountRiskSettings record for every Account with default values (all percentages = 0.00, enforceLimits = false)
- **FR-003**: System MUST enforce 1:1 relationship between Account and AccountRiskSettings (cascade delete on account removal)
- **FR-004**: System MUST make StartDate and StartingBalance immutable after account creation (cannot be updated via PUT endpoint)
- **FR-005**: System MUST allow users to view list of their own accounts with filtering by IsActive status
- **FR-006**: System MUST allow users to update editable account fields: name, broker, accountType, baseCurrency, timezone, notes, and nested risk settings
- **FR-007**: System MUST implement soft-delete via Archive endpoint that sets IsActive=false (accounts remain in database)
- **FR-008**: System MUST enforce user authorization - users can only access/modify their own accounts (filtered by UserId)

#### Data Validation

- **FR-009**: System MUST validate starting balance > 0 at account creation
- **FR-010**: System MUST validate all risk percentage fields are in range 0-100 with precision decimal(5,2)
- **FR-011**: System MUST validate account name is required and max 200 characters
- **FR-012**: System MUST validate broker is required and max 100 characters
- **FR-013**: System MUST validate accountType is one of: Cash, Margin, Prop, Demo
- **FR-014**: System MUST validate baseCurrency is 3-character ISO 4217 code
- **FR-015**: System MUST validate timezone is max 50 characters and valid IANA timezone format
- **FR-016**: System MUST prevent archiving already-archived accounts (return 400 error if IsActive=false)

#### Business Rules

- **FR-017**: System SHOULD warn if MaxDailyLossPct < RiskPerTradePct (informational warning, not enforced validation)
- **FR-018**: System SHOULD warn if MaxWeeklyLossPct < MaxDailyLossPct (informational warning, not enforced validation)
- **FR-019**: System MUST support predefined broker list with "Other" option allowing custom broker name
- **FR-020**: System MUST support 10 major currencies: USD, EUR, SEK, GBP, JPY, CHF, AUD, CAD, NOK, DKK
- **FR-021**: System MUST support 12 common timezones: UTC, America/New_York, America/Chicago, America/Los_Angeles, Europe/London, Europe/Paris, Europe/Stockholm, Asia/Tokyo, Asia/Hong_Kong, Asia/Singapore, Australia/Sydney, Pacific/Auckland

#### API Contracts

- **FR-022**: System MUST expose GET /api/accounts endpoint with optional includeArchived query parameter
- **FR-023**: System MUST expose GET /api/accounts/{id} endpoint returning single account with nested risk settings
- **FR-024**: System MUST expose POST /api/accounts endpoint accepting CreateAccountRequest with nested RiskSettingsDto
- **FR-025**: System MUST expose PUT /api/accounts/{id} endpoint accepting UpdateAccountRequest (excluding immutable fields)
- **FR-026**: System MUST expose POST /api/accounts/{id}/archive endpoint for soft-delete
- **FR-027**: All API endpoints MUST require JWT authentication (bearerAuth)
- **FR-028**: System MUST return 404 for account access when account doesn't exist OR doesn't belong to authenticated user (security)
- **FR-029**: System MUST return 400 with validation errors object when input validation fails
- **FR-030**: System MUST return 201 Created with account details on successful account creation

### Non-Functional Requirements

#### Performance

- **NFR-001**: Frontend form validation MUST debounce user input with 300ms delay
- **NFR-002**: API response time SHOULD be < 500ms for CRUD operations under normal load
- **NFR-003**: Database queries MUST use composite indexes (user_id, is_active) and (user_id, created_at DESC)

#### Security

- **NFR-004**: All endpoints MUST require JWT authentication
- **NFR-005**: User authorization MUST filter all queries by UserId from JWT claims
- **NFR-006**: System MUST prevent users from accessing accounts belonging to other users (return 404, not 403 to avoid enumeration)

#### Data Integrity

- **NFR-007**: System MUST use decimal(18,2) precision for currency amounts (StartingBalance)
- **NFR-008**: System MUST use decimal(5,2) precision for percentage values (risk settings)
- **NFR-009**: System MUST store all timestamps as DateTimeOffset (timezone-aware)
- **NFR-010**: System MUST automatically set CreatedAt and UpdatedAt timestamps via BaseEntity

#### Testing

- **NFR-011**: Unit test coverage SHOULD exceed 80% for backend services and controllers
- **NFR-012**: Each user story MUST have corresponding E2E test coverage
- **NFR-013**: API contracts MUST be validated against OpenAPI specification

#### Architecture

- **NFR-014**: Implementation MUST follow Modular Monolith pattern (mirror Modules/Strategies structure)
- **NFR-015**: Backend MUST use folder structure: Modules/Accounts/Infrastructure/Data/ for EF configurations
- **NFR-016**: All database tables MUST use lowercase naming with underscores (accounts, account_risk_settings)
- **NFR-017**: All database indexes MUST have explicit names (ix_accounts_user_active, ix_account_risk_settings_account_id)
- **NFR-018**: Database schema MUST be "accounts" (explicitly specified in ToTable() calls)
- **NFR-019**: Frontend MUST use NgRx SignalStore pattern (mirror libs/strategies structure)
- **NFR-020**: Frontend MUST split into libs/accounts/{data-access, ui, feature} modules

### Key Entities _(include if feature involves data)_

- **Account**: Represents a brokerage account belonging to a user. Key attributes: Id (Guid), UserId (Guid FK), Name (string 200), Broker (string 100), AccountType (enum: Cash/Margin/Prop/Demo), BaseCurrency (string 3 ISO code), StartDate (DateTimeOffset - immutable), StartingBalance (decimal 18,2 - immutable), Timezone (string 50 IANA), Notes (string nullable), IsActive (bool, default true), CreatedAt, UpdatedAt. Relationships: N:1 with ApplicationUser, 1:1 with AccountRiskSettings

- **AccountRiskSettings**: Represents default risk management rules for an account. Key attributes: Id (Guid), AccountId (Guid FK unique), RiskPerTradePct (decimal 5,2 default 0.00), MaxDailyLossPct (decimal 5,2 default 0.00), MaxWeeklyLossPct (decimal 5,2 default 0.00), EnforceLimits (bool default false), CreatedAt, UpdatedAt. Relationship: 1:1 with Account (cascade delete)

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can complete account creation (US1) in under 90 seconds from clicking "Create Account" to seeing confirmation
- **SC-002**: 100% of user stories (US1-US4) are independently testable and deliverable as standalone features
- **SC-003**: All 79 implementation tasks complete successfully with passing unit tests (>80% coverage)
- **SC-004**: API response times remain under 500ms for all CRUD operations at baseline load (10 concurrent users)
- **SC-005**: Frontend validation provides feedback within 300ms of user input (debounced)
- **SC-006**: Zero security vulnerabilities - users cannot access accounts belonging to other users
- **SC-007**: 100% pattern alignment with existing Strategies module (folder structure, naming conventions, indexes)
- **SC-008**: Database migration runs successfully without manual intervention on PostgreSQL
- **SC-009**: All 5 API endpoints pass OpenAPI contract validation tests
- **SC-010**: E2E tests cover all 4 user stories with passing acceptance scenarios
