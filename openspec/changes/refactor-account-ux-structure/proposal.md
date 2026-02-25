## Why

The current account experience is form-centric and does not enforce a clear lifecycle between onboarding, viewing, and editing, which increases UX ambiguity for a risk-sensitive trading workflow. Refactoring now is necessary to establish a stable account context model before expanding strategies, journal, analytics, and AI features.

## What Changes

- Split account routing into explicit modes:
- `/account/new` for full-page account creation
- `/account/:id` for account overview as default read-only state
- Remove inline form-only implementation on `/account`
- Add onboarding behavior when no accounts exist:
- Auto-redirect to `/account/new`
- Focused onboarding copy and single primary save action
- Post-create redirect to `/strategies/new` when onboarding
- Implement read-only account overview with explicit edit toggle:
- Read-only risk summary and account details cards
- Inline edit mode on the same route (`/account/:id`) with save/cancel transitions
- No modal editing and no always-editable default view
- Prepare multi-account support with global active account context:
- Introduce `ActiveAccountId` in global state
- Set newly created accounts as active
- Add “Add Account” action routing to `/account/new`
- Add active account indicator in app shell context
- Require account-scoped filtering for journal, analytics, and AI queries using `ActiveAccountId`
- Refactor backend API behavior to align with account context model:
- Require account context on account-dependent query endpoints
- Enforce authenticated-user ownership checks for provided account context
- Standardize account-scoped filtering contracts for trades, analytics, and AI-oriented endpoints
- Keep account page intentionally focused:
- Exclude analytics-heavy content from account UX
- Exclude broker integration from MVP scope

## Capabilities

### New Capabilities

- `account-ux-lifecycle`: Defines route-driven account states for onboarding, creation, read-only overview, and inline edit mode.
- `active-account-context`: Defines global active account selection and account-scoped behavior across journal, analytics, and AI query surfaces.

### Modified Capabilities

- None.

## Impact

- Frontend routing and account feature flows (`/account/new`, `/account/:id`, onboarding redirects, edit-mode toggling).
- Account feature state management (local edit state + global active account context).
- Shared query/filter plumbing for account-scoped data access in journal, analytics, and AI-related request paths.
- Backend modules and API contracts handling account-scoped queries (Accounts, Trades, and account-dependent read endpoints).
- Backend validation and authorization logic for account ownership and account-context enforcement.
- UI structure and components for account overview, creation layout, and contextual account actions.
