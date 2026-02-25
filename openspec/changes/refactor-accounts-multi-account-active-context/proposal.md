## Why

The current account implementation assumes a single-account workflow, which breaks core product needs for traders who operate multiple accounts (for example personal and prop firm) with distinct risk rules. Refactoring now is necessary to establish a durable account-context foundation so trades, journal, analytics, and account management all behave consistently and safely at scale.

## What Changes

- Refactor account UX and routing from singular `/account` behavior to plural accounts:
- `/accounts` list view
- `/accounts/new` full-page create flow
- `/accounts/:id` detail view with read-only default and inline edit mode
- Keep `/account` as redirect to `/accounts`
- Introduce global active account context:
- Store `activeAccountId` with derived active account and persist context (local storage and/or backend profile strategy)
- Add account switcher UI and visible active account indicator
- Apply active account as default context across account-scoped features
- Enable multi-account account management patterns:
- list, view, create, edit, set-active
- optional archive/unarchive (soft state)
- explicitly remove hard-delete behavior from API and UI
- Enforce account linkage and scoping for trades:
- `trade.accountId` required
- trade create defaults to active account
- trade queries filtered by account context
- Strengthen backend contracts:
- support account-scoped query/filter parameters where applicable
- validate account ownership for authenticated user on account-dependent endpoints
- add set-active and optional archive/unarchive endpoint behavior as needed

## Capabilities

### New Capabilities

- `accounts-multi-account-management`: Multi-account routes and workflows for list/create/detail/edit/set-active with no hard-delete actions.
- `active-account-context`: Global active account state, persistence, account switcher UI, and cross-feature account scoping behavior.

### Modified Capabilities

- None.

## Impact

- Frontend routing, navigation labels, and account feature UI components (`/accounts`, `/accounts/new`, `/accounts/:id`, and `/account` redirect).
- Frontend state layer for accounts and active account context, including persistence and reactive refetch behavior.
- Trades frontend and backend integration to require and propagate `accountId` context.
- Backend accounts and trade APIs, authorization checks, and optional archive/state transitions.
- Data model and contracts for account type, risk-rule structure, and optional archival state.
