# Feature Specification: Trades Data Refactor

**Feature Branch**: `005-trades-data-refactor`  
**Created**: 2026-02-22  
**Status**: Draft  
**Input**: User description: "Refactor trades: replace hardcoded HTML trades with real data from the backend. Update Trade model on frontend and backend to include all fields (id, strategy, date, symbol, type BUY/SELL, entryPrice, positionSize, exitPrice, commission, profitLoss, status win/loss/open, investedAmount). Update database schema. Implement real API endpoint."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Real Trade History (Priority: P1)

A trader navigates to the Trade History page and sees their actual trades loaded from the system, not placeholder data. Each trade displays the correct symbol, type (BUY/SELL), entry price, exit price, position size, invested amount, commission, profit/loss, status (Win/Loss/Open), and date.

**Why this priority**: This is the core value of the feature — replacing hardcoded sample data with real, persisted trade records. Without this, the trades page has no real utility.

**Independent Test**: Navigate to the trades page while authenticated; the table must display trades fetched from the live API endpoint with all required fields populated correctly.

**Acceptance Scenarios**:

1. **Given** a trader is authenticated and has trades recorded, **When** they navigate to the Trade History page, **Then** the table shows their actual trades with all fields (symbol, type, entry price, exit price, position size, invested amount, commission, profit/loss, status, date) loaded from the backend.
2. **Given** a trader has no trades yet, **When** they navigate to the Trade History page, **Then** the table displays an empty-state message instead of sample data.
3. **Given** the backend is unreachable, **When** the page loads, **Then** a meaningful error indicator is shown and no stale sample data is rendered.

---

### User Story 2 - Correct Trade Model Alignment (Priority: P1)

The trade data model is unified across the frontend and backend: both use the same 14 API response fields (id, accountId, strategyId, date, symbol, type, entryPrice, positionSize, exitPrice, commission, profitLoss, status, investedAmount, createdAt). No field mismatches exist between what the API returns and what the frontend displays.

**Why this priority**: Model misalignment causes runtime errors and data display issues. This must be resolved as a prerequisite for any data-driven feature.

**Independent Test**: Call the list-trades API endpoint and confirm the response shape matches the frontend Trade interface field-for-field.

**Acceptance Scenarios**:

1. **Given** the API returns a trade record, **When** the frontend maps the response to its Trade model, **Then** all 14 API response fields are present and correctly typed with no missing or undefined values.
2. **Given** a trade with no associated strategy, **When** it is displayed, **Then** the strategy field shows as empty without errors.
3. **Given** a trade with status "Open", **When** it is displayed, **Then** exitPrice, commission, and profitLoss render as zero or a pending indicator without breaking the UI.

---

### User Story 3 - Database Schema Reflects Full Trade Model (Priority: P2)

The trade table in the database stores all required fields with correct types and constraints. Existing records migrate without data loss.

**Why this priority**: Persistent storage of the full trade model is a prerequisite for the API to serve real data.

**Independent Test**: Inspect the trades table schema post-migration; confirm all required columns exist with correct nullability. Confirm existing data is intact.

**Acceptance Scenarios**:

1. **Given** the database migration runs, **When** the trades table is inspected, **Then** all required columns (id, account_id, strategy_id nullable, symbol, type, entry_price, exit_price nullable, position_size, invested_amount, commission, profit_loss, status, date, created_at, updated_at) are present.
2. **Given** existing trade records in the database, **When** the migration runs, **Then** previously stored field values are retained and no records are deleted.
3. **Given** a new trade saved with status "Open" and no exit data, **When** retrieved, **Then** exit_price, commission, and profit_loss are stored as zero or null as designed.

---

### Edge Cases

- Trades with status "Open" and zero exitPrice/commission/profitLoss must display without errors or crashes.
- Pagination must remain functional for large trade lists (e.g., hundreds of records).
- A trade referencing a deleted strategy must load and display without errors (strategy shown as empty).
- Unexpected type or status values from the API must be handled gracefully on the frontend.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST expose a functional API endpoint that returns a list of trades for the authenticated user, matching the full Trade model.
- **FR-002**: The Trade data model MUST include the following 14 API response fields: id (UUID string), accountId, strategyId (optional), date, symbol, type (BUY or SELL), entryPrice, positionSize, exitPrice (nullable), commission, profitLoss, status (Win/Loss/Open), investedAmount, and createdAt.
- **FR-003**: The frontend trades page MUST fetch trade data from the API on load and display it in the table, replacing all hardcoded sample data.
- **FR-004**: The database schema MUST be updated via a migration to persist all Trade model fields without data loss on existing records.
- **FR-005**: The backend Trade domain entity MUST be refactored to include all fields: type, positionSize, investedAmount, commission, profitLoss, status, and date.
- **FR-006**: The frontend MUST display a loading indicator while trades are being fetched and a meaningful empty-state message when no trades exist.
- **FR-007**: The frontend MUST handle API errors gracefully with an error indicator, without rendering sample/stale data.
- **FR-008**: Trade type MUST be constrained to BUY or SELL; trade status MUST be constrained to Win, Loss, or Open — enforced in the API via C# enum validation (status stored and returned as PascalCase string).
- **FR-009**: The trades table MUST remain paginated and sortable after the refactor.
- **FR-010**: Strategy reference on a trade MUST be nullable; trades without a strategy MUST load and display without errors.

### Key Entities _(include if feature involves data)_

- **Trade**: Represents a single trading transaction. Attributes: id (UUID string), accountId (owner), strategyId (optional), date, symbol, type (BUY/SELL), entryPrice, exitPrice (nullable), positionSize, investedAmount, commission, profitLoss, status (Win/Loss/Open), createdAt, updatedAt.
- **Strategy**: Existing entity optionally linked to a trade via strategyId. Read-only in this feature's scope.
- **Account**: Existing entity that owns trades; determines which trades the API returns for the authenticated user.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The Trade History page loads and displays real trade data within 2 seconds under normal network conditions.
- **SC-002**: 100% of Trade model fields (all 14 API response fields) are correctly transmitted from the database through the API to the frontend display without loss or type mismatch.
- **SC-003**: The database migration completes with zero data loss — all pre-existing trade records retain their stored values.
- **SC-004**: The hardcoded sample data is fully removed; the page shows an empty state when no trades exist in the system.
- **SC-005**: The trades table supports pagination and sorting for lists of up to 1,000 trades without performance degradation.
- **SC-006**: Trades with "Open" status (missing exit data) display without errors in 100% of cases.

## Assumptions

- The authenticated user's account ID is available via the auth context on the backend and is used to filter returned trades.
- Pagination is client-side for this implementation; server-side pagination is out of scope.
- The `profitLoss` and `investedAmount` fields are stored values supplied at trade creation time, not computed dynamically by the backend.
- Commission defaults to 0 when not specified.
- The `date` field represents trade execution date, not the `createdAt` timestamp.
- Frontend table column headers will be updated to reflect the new model fields (replacing "Quantity/Price/Total" with "Position Size/Entry Price/Invested Amount" equivalents).
- Creating new trades (form/UI) is out of scope for this feature — only data model alignment and the list endpoint are in scope.
