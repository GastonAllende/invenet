# Feature Specification: Fix Strategy Owner Field (accountId → userId)

**Feature Branch**: `004-fix-strategy-account-id`  
**Created**: 2026-02-21  
**Status**: Implemented  
**Input**: User description: "I saw that the strategies has account id but with the used id in it"

## Background

The `Strategy` model has a field named `accountId`, but its value is the **user's ID**, not an account ID. Strategies are owned directly by users — they are not account-scoped. The field name is wrong and must be corrected.

The fix is: rename `accountId` → `userId` everywhere it appears (frontend model, backend entity, database column, API contracts).

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Strategies Are Owned by the User, Not the Account (Priority: P1)

A trader's strategies are personal to them as a user and are visible regardless of which account they are currently viewing. The system correctly identifies strategy ownership via the user's ID.

**Why this priority**: This is a data correctness and naming bug. A misnamed field causes developer confusion and risks future logic errors (e.g. accidentally filtering by account instead of user).

**Independent Test**: Can be tested by verifying a logged-in user sees all their strategies regardless of which account is selected, and that stored strategy records carry the user's ID in the owner field (not an account ID).

**Acceptance Scenarios**:

1. **Given** a trader is logged in, **When** they list their strategies, **Then** the system returns all strategies owned by that user's ID
2. **Given** a strategy is created by a user, **When** inspecting the stored record, **Then** the owner field contains the user's ID (not any account ID)
3. **Given** a trader switches between accounts, **When** they view strategies, **Then** the same strategies are visible — strategies are not filtered by account

---

### Edge Cases

- **Existing data**: Any strategy records already in the database store the user's ID in the `account_id` column — the values are correct, only the column name changes. A migration renames the column; no data values need updating.
- **API response shape**: The strategy response DTOs (`GetStrategyResponse`, `StrategyListItem`, `CreateStrategyResponse`) do not expose the owner field at all — neither `accountId` nor `userId` appears in API responses. No API consumer changes are needed for response reading.
- **Frontend model**: The `Strategy` TypeScript interface had an `accountId` field (already renamed to `userId`) — this is the only consumer-facing change.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The `Strategy` model MUST have a `userId` field (not `accountId`) storing the ID of the owning user
- **FR-002**: The backend database column MUST be renamed from `account_id` to `user_id` on the strategies table
- **FR-004**: Strategy queries MUST filter by `userId` (the authenticated user's ID) when listing strategies
- **FR-005**: Strategies MUST NOT be filtered or scoped by account ID at the backend query layer — the `GetCurrentUserId()` method (not `GetCurrentAccountId()`) MUST be used in all controller actions

### Key Entities

- **Strategy**: Represents a named trading methodology. Owned directly by a **User** via `userId`. Not linked to any specific account.
- **User**: The authenticated trader. Directly owns zero or more Strategies.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Zero occurrences of `accountId` remain on the `Strategy` model, backend entity, or database schema after the fix
- **SC-002**: A logged-in user sees the same strategy list regardless of which account is active

## Out of Scope _(optional)_

- Account-level strategy filtering or isolation (strategies are user-scoped by design, not account-scoped)
- Any other changes to the strategy feature beyond this field rename
