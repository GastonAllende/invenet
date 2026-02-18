# Feature Specification: Trade Strategy Association

**Feature Branch**: `001-trade-strategy`  
**Created**: February 18, 2026  
**Status**: Draft  
**Input**: User description: "We have accounts. Lets add a feature that it should be possible to add a strategy for a trading. When i journal my trade or create my trade it should be possible to add the strategy that i used."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Create and Manage Trading Strategies (Priority: P1)

Traders can create, view, edit, and delete their own custom trading strategies. Each strategy has a name and optional description to help them organize their approaches. This is the foundation - traders need strategies before they can assign them to trades.

**Why this priority**: Essential foundation - traders must create strategies before they can assign them to trades. Without this, no other functionality is possible. This is the true starting point and MVP.

**Independent Test**: Can be tested independently by accessing the strategy management form in the strategies library, creating new strategies, editing existing ones, viewing the strategy list, and verifying strategy CRUD operations work correctly.

**Acceptance Scenarios**:

1. **Given** a trader wants to create a new strategy, **When** they access the strategy creation form in the strategies library, **Then** they can add a new strategy with a name (required) and optional description
2. **Given** a trader has created multiple strategies, **When** they view their strategy list, **Then** they see all their defined strategies with names and descriptions
3. **Given** a trader wants to modify a strategy, **When** they edit the strategy name or description and save, **Then** the changes are persisted
4. **Given** a trader wants to remove a strategy, **When** they delete it, **Then** the system either prevents deletion if trades use it OR handles orphaned trade associations appropriately
5. **Given** a trader tries to create a strategy with a duplicate name, **When** they save it, **Then** the system prevents creation and shows an error

---

### User Story 2 - Assign Strategy to New Trade (Priority: P2)

When a trader creates a new trade entry, they can select which trading strategy they used from their list of strategies. This helps categorize trades by approach and enables later analysis of which strategies perform best.

**Why this priority**: Core value proposition - this is where traders start seeing value from their created strategies. Builds directly on P1.

**Independent Test**: Can be fully tested by creating a trade and selecting a strategy from a dropdown/list during trade creation, then verifying the strategy appears when viewing the trade details. Requires at least one strategy to exist (from P1).

**Acceptance Scenarios**:

1. **Given** a trader is creating a new trade, **When** they view the trade creation form, **Then** they see a field to select a trading strategy
2. **Given** a trader has selected a strategy, **When** they save the trade, **Then** the strategy is stored with the trade
3. **Given** a trader views their saved trade, **When** they check the trade details, **Then** they see which strategy was used
4. **Given** no strategies have been created yet, **When** a trader creates a trade, **Then** they can leave the strategy field empty (optional field)
5. **Given** a trader has created strategies, **When** they open the strategy selection, **Then** they see all their available strategies

---

### User Story 3 - Add Strategy to Existing Trade Journal (Priority: P3)

Traders can add or update the strategy for trades they've already recorded in their journal. This allows them to refine their categorization or add strategies to historical trades.

**Why this priority**: Enhances P2 by allowing retrospective organization of existing trade data. Valuable for cleaning up historical data but not required for core workflow.

**Independent Test**: Can be tested independently by editing an existing trade in the journal and adding/changing the strategy field.

**Acceptance Scenarios**:

1. **Given** a trader is viewing an existing trade in their journal, **When** they edit the trade, **Then** they see the strategy field
2. **Given** a trader edits an existing trade, **When** they select or change the strategy and save, **Then** the updated strategy is associated with the trade
3. **Given** a trade already has a strategy assigned, **When** a trader removes the strategy assignment, **Then** the trade can be saved without a strategy

---

### User Story 4 - Filter and Analyze Trades by Strategy (Priority: P4)

Traders can filter their trade journal to view only trades that used a specific strategy, enabling performance analysis by approach.

**Why this priority**: Advanced analytics feature that builds on P1-P3. Valuable for power users but not essential for basic trade journaling with strategies.

**Independent Test**: Can be tested by applying a strategy filter in the trade journal and verifying only trades with that strategy are displayed.

**Acceptance Scenarios**:

1. **Given** a trader is viewing their trade journal, **When** they apply a strategy filter, **Then** only trades using that strategy are shown
2. **Given** multiple strategies exist, **When** a trader selects a strategy filter, **Then** they see statistics for that strategy (win rate, P&L, number of trades)
3. **Given** a trader has filtered by strategy, **When** they clear the filter, **Then** they see all trades again

---

### Edge Cases

- What happens when a trader deletes a strategy that is assigned to existing trades?
- How does the system handle very long strategy names (200+ characters)?
- What if a trader tries to create duplicate strategy names?
- Can strategies be shared between different trading accounts, or are they account-specific?
- What happens if a trader has hundreds of strategies - how is the selection UI handled?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST allow users to optionally associate a trading strategy with each trade entry
- **FR-002**: System MUST display the strategy field when creating a new trade
- **FR-003**: System MUST display the strategy field when editing an existing trade
- **FR-004**: System MUST allow users to create custom trading strategies
- **FR-005**: System MUST allow users to edit existing trading strategies
- **FR-006**: System MUST allow users to delete trading strategies (with appropriate handling of trades using that strategy)
- **FR-007**: System MUST display the assigned strategy when viewing trade details
- **FR-008**: System MUST persist the strategy-to-trade association
- **FR-009**: System MUST allow trades to exist without an assigned strategy (strategy is optional)
- **FR-010**: System MUST prevent creation of duplicate strategy names for the same user
- **FR-011**: Trading strategies MUST be scoped to the user's account (strategies are not shared between accounts unless explicitly configured)
- **FR-012**: System MUST allow filtering trades by strategy in the trade journal

### Key Entities

- **Trading Strategy**: Represents a named trading approach/methodology. Has a name (required), optional description, and is owned by an account. Can be associated with zero or more trades.
- **Trade**: Existing entity that now has an optional relationship to Trading Strategy. One trade can have at most one strategy assigned; one strategy can be used by many trades.

- **Account**: Existing entity that owns Trading Strategies. Strategies belong to a specific account and are not visible to other accounts.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can create and assign a strategy to a trade in under 30 seconds
- **SC-002**: Users can filter their trade journal by strategy and see results within 2 seconds
- **SC-003**: 80% of active traders create at least one custom strategy within their first week of using the feature
- **SC-004**: Users successfully associate strategies with at least 60% of their new trades
- **SC-005**: No data loss when editing or deleting strategies (trades either maintain reference or are safely updated)
- **SC-006**: System supports at least 100 custom strategies per account without UI degradation

## Assumptions _(optional)_

- Traders use distinct, repeatable methodologies that warrant categorization
- Most traders will have between 3-10 strategies they regularly use
- Strategy names are short (typically under 50 characters)
- Strategy assignment happens at trade creation time, though retrospective assignment is valuable
- Default/example strategies may be helpful but are not required for MVP

## Dependencies _(optional)_

- Existing trade creation and editing functionality
- Existing trade journal/listing functionality
- Existing account/user authentication system
- Database schema can be modified to add new entities and relationships

## Out of Scope _(optional)_

- Sharing strategies between users or accounts
- Strategy templates or marketplace
- Automated strategy recommendation based on trade characteristics
- Complex strategy hierarchies or taxonomies (parent/child strategies)
- Strategy performance analytics beyond basic filtering (detailed P&L analysis, win rates, etc.)
- Predefined/system-provided strategy templates
- Strategy versioning or history tracking
