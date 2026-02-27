# Feature Specification: Trade CRUD — Add, Edit and Delete Trades

**Feature Branch**: `006-trade-crud`  
**Created**: 2026-02-23  
**Status**: Draft  
**Input**: User description: "Add, edit and delete trades. Dialog modal popup as in strategies and accounts"

## User Scenarios & Testing _(mandatory)_

### User Story 1 — Create a Trade (Priority: P1)

A user can open a "New Trade" dialog from the Trade History page, fill in the trade details, and save the new trade. The trade immediately appears in the list without a page reload.

**Why this priority**: Creating trades is the primary data-entry action. Without it, the trade list is empty and no other CRUD operations have data to act on. This is the MVP slice.

**Independent Test**: From the Trade History page, click "New Trade", fill in required fields (symbol, type, date, entry price, position size, account), click Save — the new trade appears at the top of the list.

**Acceptance Scenarios**:

1. **Given** the user is on the Trade History page, **When** they click "New Trade", **Then** a modal dialog opens with an empty trade form.
2. **Given** the dialog is open with all required fields filled, **When** the user clicks Save, **Then** the dialog closes, a success notification is shown, and the new trade appears in the list.
3. **Given** the form has one or more missing required fields, **When** the user clicks Save, **Then** inline validation errors appear under each invalid field and the dialog remains open.
4. **Given** the dialog is open, **When** the user clicks Cancel or the dialog's close control, **Then** the dialog closes without saving and the trade list is unchanged.
5. **Given** the save request fails due to a network or server error, **When** the response arrives, **Then** an error notification is shown, the dialog remains open, and all previously entered data is preserved.

---

### User Story 2 — Edit a Trade (Priority: P2)

A user can select an existing trade from the Trade History list, open it in the same modal dialog pre-populated with its current values, change any fields, and save the updates.

**Why this priority**: Trade corrections are essential after erroneous data entry. Editing builds directly on the create flow and is more impactful than deletion.

**Independent Test**: From the Trade History list, click the Edit action on any trade — the dialog opens with all fields pre-filled; change the symbol, click Save — the updated trade is reflected in the list immediately.

**Acceptance Scenarios**:

1. **Given** the user clicks Edit on a trade row, **When** the dialog opens, **Then** all editable fields are pre-populated with the trade's current values.
2. **Given** the dialog is open with modified valid data, **When** the user clicks Save, **Then** the dialog closes, a success notification is shown, and the list reflects the updated values.
3. **Given** the user modifies fields and then clicks Cancel, **When** the dialog closes, **Then** the original trade values remain unchanged in the list.
4. **Given** the update request fails, **When** the response arrives, **Then** an error notification is shown and the dialog stays open with the user's edits intact.

---

### User Story 3 — Delete a Trade (Priority: P3)

A user can permanently delete a trade from the Trade History list after confirming a warning prompt that the action cannot be undone.

**Why this priority**: Deletion is needed to remove incorrect or test trades, but is the least-used operation. The confirmation step prevents accidental data loss.

**Independent Test**: From the Trade History list, click Delete on a trade — a confirmation prompt appears; click Confirm — the trade is removed from the list immediately.

**Acceptance Scenarios**:

1. **Given** the user clicks Delete on a trade row, **When** the click is registered, **Then** a confirmation prompt appears warning that the action cannot be undone.
2. **Given** the confirmation prompt is shown, **When** the user clicks Cancel, **Then** the prompt closes and the trade remains in the list unchanged.
3. **Given** the confirmation prompt is shown, **When** the user confirms deletion, **Then** the trade is immediately removed from the list and a success notification is shown.
4. **Given** the delete request fails, **When** the response arrives, **Then** an error notification is shown and the trade remains in the list.

---

### Edge Cases

- What happens when the user tries to edit a trade that was already deleted in another session? → An error notification is shown and the stale entry is removed from the local list.
- What happens when a required numeric field is zero? → Zero is a valid numeric value; only truly empty/absent fields should trigger validation errors.
- What happens when Exit Price is blank but Status is set to "Win" or "Loss"? → This is allowed; no cross-field validation between Exit Price and Status is required.
- What happens when the user deletes the last trade in the list? → The empty-state message is displayed after the deletion completes.
- What happens when the dialog is open and a different background error occurs? → The dialog is unaffected; errors surface only upon explicit save or delete actions.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Users MUST be able to open a "Create Trade" modal dialog from the Trade History page via a clearly labeled button.
- **FR-002**: Users MUST be able to open an "Edit Trade" modal dialog for any trade in the list via a per-row edit action.
- **FR-003**: Users MUST be able to initiate deletion of any trade via a per-row delete action that presents a confirmation prompt before permanently removing the record.
- **FR-004**: The trade form MUST collect the following required fields: Symbol, Type (BUY / SELL), Date, Entry Price, Position Size, Account.
- **FR-005**: The trade form MUST collect the following optional fields: Strategy, Exit Price, Commission, Status (Win / Loss / Open; defaults to Open for new trades).
- **FR-006**: Invested Amount MUST be automatically calculated as Position Size × Entry Price and displayed as a non-editable value in the form, updating whenever either source field changes.
- **FR-007**: Profit/Loss MUST be automatically calculated as (Exit Price − Entry Price) × Position Size − Commission when Exit Price is provided, displayed as a non-editable value; when Exit Price is absent the calculated value is zero.
- **FR-008**: The form MUST display inline validation errors for all required fields before allowing submission.
- **FR-009**: On successful create or update, the trade list MUST reflect the change immediately without a full page reload.
- **FR-010**: On successful delete, the trade MUST be removed from the list immediately without a full page reload.
- **FR-011**: All mutating operations (create, update, delete) MUST display a success notification on completion and an error notification on failure.
- **FR-012**: The modal dialog MUST be dismissible via both a Cancel button inside the form and a close control on the dialog frame, discarding any unsaved changes.
- **FR-013**: The form and any action buttons MUST be disabled/in a loading state while a save or delete operation is in progress, preventing duplicate submissions.
- **FR-014**: The Account selector in the form MUST only list accounts belonging to the authenticated user.
- **FR-015**: The Strategy selector in the form MUST only list strategies belonging to the authenticated user and must be optional (no strategy selected is valid).

### Key Entities

- **Trade**: A single market transaction. Key attributes: unique identifier, owning account, optional linked strategy, direction (buy or sell), date executed, ticker symbol, entry price, optional exit price, position size, invested amount (derived from position size and entry price), commission paid, profit/loss (derived from prices, size, and commission), status (Open, Win, or Loss).
- **Account**: The trading account a trade is recorded against. Each trade must belong to exactly one of the user's accounts.
- **Strategy**: An optional trading plan a trade can be categorised under. A trade may have no associated strategy.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A user can create a new trade in under 60 seconds from clicking "New Trade" to seeing it appear in the list.
- **SC-002**: A user can edit an existing trade in under 45 seconds from clicking the edit action to seeing the updated values in the list.
- **SC-003**: A user can delete a trade in under 15 seconds including the confirmation step.
- **SC-004**: All three operations (create, edit, delete) complete without browser errors under normal network conditions.
- **SC-005**: Invalid or incomplete trade data is rejected by the form 100% of the time — no incomplete trade can be persisted.
- **SC-006**: Invested Amount and Profit/Loss values update automatically each time a source field changes, with no additional user interaction required.

## Assumptions

- The Trade History page and the ability to read trades already exist (delivered by feature 005).
- The system will provide new data-writing capabilities for creating, updating, and deleting individual trades as part of this feature.
- The current user's list of accounts is already accessible within the application and will be used to populate the Account selector in the form.
- The current user's list of strategies is already accessible within the application and will be used to populate the optional Strategy selector in the form.
- The modal dialog follows the same visual conventions already established for similar create/edit flows elsewhere in the application.
- No bulk-create or bulk-delete is in scope for this feature; all operations act on a single trade at a time.
