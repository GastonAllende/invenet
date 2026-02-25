## 1. Route And Navigation Refactor

- [ ] 1.1 Add frontend routes for `/accounts`, `/accounts/new`, and `/accounts/:id`.
- [ ] 1.2 Add legacy `/account` redirect to `/accounts`.
- [ ] 1.3 Update menu/sidebar label and links from “Account” to “Accounts”.

## 2. Accounts List Page (`/accounts`)

- [ ] 2.1 Implement accounts list view (PrimeNG table) with required columns: name, type, broker, base currency, risk-per-trade, max daily loss, status.
- [ ] 2.2 Add row actions for View and Set Active (and archive/unarchive if enabled).
- [ ] 2.3 Add top-level “Add Account” action linking to `/accounts/new`.
- [ ] 2.4 Add active account row highlight and active badge indicator.
- [ ] 2.5 Remove any delete action/control from accounts list UI.

## 3. Account Create Page (`/accounts/new`)

- [ ] 3.1 Build full-page create form with account details and risk rules sections.
- [ ] 3.2 Add advanced collapsed section for optional fields (weekly loss, portfolio exposure, notes).
- [ ] 3.3 Implement create submission to persist account, set it active, show success toast, and redirect to `/accounts` or `/accounts/:id`.
- [ ] 3.4 Ensure create form uses account type options: Personal, Prop Firm, Funded.

## 4. Account Detail Page (`/accounts/:id`)

- [ ] 4.1 Implement read-only overview default mode with risk summary and account details cards.
- [ ] 4.2 Add header actions: Edit, Set Active (if not active), and archive/unarchive (if enabled).
- [ ] 4.3 Implement inline edit mode on same route with Save and Cancel behavior.
- [ ] 4.4 Implement cancel reset logic to restore prior values.
- [ ] 4.5 Remove modal-based account edit interactions.

## 5. Global Active Account Context

- [ ] 5.1 Implement/extend global SignalStore with `accounts[]`, `activeAccountId`, and derived `activeAccount`.
- [ ] 5.2 Persist `activeAccountId` (localStorage and/or backend profile strategy) and restore on app initialization.
- [ ] 5.3 Add account switcher dropdown in topbar/sidebar for active account selection.
- [ ] 5.4 Add UI indicator for active account context (“Active: …”).
- [ ] 5.5 Trigger account-scoped data refetch on active account switch.

## 6. Trades Integration

- [ ] 6.1 Ensure trade create defaults `accountId` to active account.
- [ ] 6.2 Keep trade `accountId` required in trade form and payload validation.
- [ ] 6.3 Update trade list queries to filter by active account context by default.
- [ ] 6.4 Verify trade save/update flows preserve explicit account linkage.

## 7. Backend Contract And Domain Updates

- [ ] 7.1 Ensure accounts API supports list/create/get/update/set-active and optional archive/unarchive behavior.
- [ ] 7.2 Remove or disable account hard-delete endpoint behavior and any server-side delete execution path.
- [ ] 7.3 Enforce account ownership checks for account-dependent operations.
- [ ] 7.4 Enforce account-scoped filtering support on trade list and related account-dependent query endpoints.
- [ ] 7.5 Ensure account/risk field contract includes required account type and risk-rule value/unit structure.

## 8. Verification

- [ ] 8.1 Add/adjust frontend tests for route behavior (`/accounts*`, `/account` redirect).
- [ ] 8.2 Add/adjust component/store tests for active account switching and persistence recovery.
- [ ] 8.3 Add/adjust UI tests ensuring no delete account control is exposed.
- [ ] 8.4 Add/adjust trades integration tests validating active-account defaulting and required `accountId`.
- [ ] 8.5 Add/adjust backend tests for account ownership checks, account-scoped query filtering, and no-delete constraints.
