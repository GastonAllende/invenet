## 1. Routing And Entry-State Foundation

- [ ] 1.1 Add/adjust account routes to support `/account/new` and `/account/:id` as first-class paths.
- [ ] 1.2 Implement legacy `/account` redirect logic to route users to `/account/new` (no accounts) or `/account/:activeId` (accounts exist).
- [ ] 1.3 Add route-level handling for missing/invalid account IDs to prevent broken overview state.

## 2. Create-Mode UX On `/account/new`

- [ ] 2.1 Refactor account creation into a full-page layout with title/subtitle and section cards for account details and risk rules.
- [ ] 2.2 Implement onboarding-specific create view copy and single-primary-action behavior when account count is zero.
- [ ] 2.3 Implement create submit flow to persist account, set `ActiveAccountId`, and branch redirects for onboarding (`/strategies/new`) vs non-onboarding (`/account/:newId`).
- [ ] 2.4 Add create success feedback message "Account created" for non-onboarding creation flow.

## 3. Overview And Inline Edit On `/account/:id`

- [ ] 3.1 Implement read-only overview mode as default state with risk summary and account details cards and no editable controls.
- [ ] 3.2 Add header actions for Edit and Add Account in overview mode.
- [ ] 3.3 Implement local feature-store `editMode` toggle that swaps read-only fields for inline form controls without route changes.
- [ ] 3.4 Implement cancel behavior to reset local form state and return to read-only mode.
- [ ] 3.5 Implement update save flow to persist changes, exit edit mode, and show "Account updated".

## 4. Global Active Account Context

- [ ] 4.1 Add global/root state for `ActiveAccountId` with selectors/actions for initialize, set-on-create, and set-on-selection.
- [ ] 4.2 Initialize `ActiveAccountId` deterministically when accounts exist and no active account is set.
- [ ] 4.3 Add active account indicator in shell/header/sidebar context.
- [ ] 4.4 Wire Add Account action from account context to navigate to `/account/new`.

## 5. Account-Scoped Data Enforcement

- [ ] 5.1 Update journal data requests to require and pass `ActiveAccountId`.
- [ ] 5.2 Update analytics data requests to require and pass `ActiveAccountId`.
- [ ] 5.3 Update AI query input/request composition to require and pass `ActiveAccountId`.
- [ ] 5.4 Add shared guard/utilities to prevent unscoped account queries from executing.

## 6. Verification

- [ ] 6.1 Add/adjust routing tests for `/account/new`, `/account/:id`, and legacy `/account` redirect outcomes.
- [ ] 6.2 Add/adjust component/store tests for overview default mode, edit toggle, cancel reset, and save transitions.
- [ ] 6.3 Add/adjust state/query tests asserting `ActiveAccountId` propagation into journal, analytics, and AI requests.
- [ ] 6.4 Run targeted Nx tests for affected account and dependent feature projects.
