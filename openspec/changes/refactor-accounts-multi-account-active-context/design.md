## Context

The current implementation mixes account management patterns built for a single-account assumption, with modal-based editing and implicit context usage in related features. The new requirements mandate a true multi-account model with explicit route-based UX (`/accounts`, `/accounts/new`, `/accounts/:id`), a global active account context, and strict account-scoped behavior across trades and downstream analytics/reporting surfaces.

This is a cross-cutting change across frontend routes/components/stores and backend endpoint contracts. It also affects domain constraints by prohibiting hard delete and requiring account ownership + account context validation for account-dependent operations.

## Goals / Non-Goals

**Goals:**
- Provide complete multi-account UX flow:
- accounts list with active indicator and set-active action
- full-page account creation
- read-only account detail with inline edit mode
- redirect legacy `/account` route to plural `/accounts` flow
- Introduce global active account state (`activeAccountId`, derived active account) with persistence.
- Ensure trades always use `accountId`, defaulting to active account.
- Ensure account-dependent backend endpoints enforce account context and ownership.
- Remove hard delete account behavior from both UI and API.
- Optionally support archive/unarchive (soft state) without data loss.

**Non-Goals:**
- Broker integrations and external account synchronization.
- “All accounts” aggregate analytics behavior (can be introduced later).
- Full redesign of non-account features beyond required account-context integration.

## Decisions

1. Route-driven account UX model
- Decision: Move to three explicit routes: `/accounts`, `/accounts/new`, `/accounts/:id`; keep `/account` as redirect.
- Rationale: URL-level state makes navigation deterministic and supports deep links and clean mode separation.
- Alternative considered: Keep single `/account` route with nested UI modes.
- Why not: Preserves ambiguity and makes mode transitions fragile.

2. Read-only-by-default detail with inline edit
- Decision: `/accounts/:id` renders read-only overview first; edit toggles inline on same route with save/cancel.
- Rationale: Matches financial control-panel behavior and minimizes accidental edits.
- Alternative considered: modal editing and always-editable form.
- Why not: Conflicts with UX requirements and reduces state clarity.

3. Global Active Account store as shared context boundary
- Decision: Maintain `accounts[]`, `activeAccountId`, and derived `activeAccount` in a global SignalStore; persist `activeAccountId` client-side and optionally backend-side.
- Rationale: Provides one canonical context used by trades and account-scoped consumers.
- Alternative considered: feature-local active account state.
- Why not: Leads to duplicated logic and context drift between modules.

4. Account-scoped query contracts for trades and related endpoints
- Decision: Require account context for account-dependent list/query endpoints, beginning with trades list/filter.
- Rationale: Prevents accidental cross-account data leakage and ensures predictable refetch behavior on account switch.
- Alternative considered: load all user data and filter client-side.
- Why not: insecure pattern and weak scaling behavior.

5. No hard delete account policy
- Decision: Remove/disable hard delete UI and endpoint behavior for accounts; support archive/unarchive semantics where needed.
- Rationale: Preserves financial records and aligns with explicit requirement.
- Alternative considered: retain delete with safeguards.
- Why not: still violates product constraints and complicates auditing.

## Risks / Trade-offs

- [Risk] Existing routes/components may still reference `/account` and singular assumptions -> Mitigation: add route redirects and migration checklist for all known entry points (menu, links, buttons).
- [Risk] Active account persistence can become stale if referenced account is archived/removed from visible list -> Mitigation: validate persisted ID against current accounts and auto-fallback to first eligible account.
- [Risk] Backend contract changes may break older frontend calls lacking `accountId` -> Mitigation: coordinate rollout with frontend update in same release and explicit 400 responses with actionable error messages.
- [Trade-off] Default account scoping can limit cross-account views -> Mitigation: explicitly defer “all accounts” aggregate mode as a future capability.
- [Risk] Removing delete may surprise existing users/workflows -> Mitigation: replace with archive/unarchive state and clear status badges.

## Migration Plan

1. Frontend routes and navigation:
- Add `/accounts`, `/accounts/new`, `/accounts/:id`.
- Add `/account` redirect to `/accounts`.
- Rename menu/sidebar label from “Account” to “Accounts”.

2. Accounts frontend refactor:
- Implement accounts list page with set-active and archive/unarchive actions.
- Implement full-page create page using card sections and advanced accordion.
- Implement detail page read-only overview and inline edit toggle.
- Remove delete actions and controls from account UI.

3. Active account context:
- Introduce/extend global SignalStore for `accounts`, `activeAccountId`, `activeAccount`.
- Persist active account and initialize on load.
- Add account switcher UI and active indicator in topbar/sidebar.

4. Trades integration:
- Default trade create `accountId` from active account.
- Support optional override in trade form.
- Update trade list calls to include account filter from active context.

5. Backend updates:
- Enforce account-scoped query filtering and account ownership checks on account-dependent endpoints.
- Ensure trade endpoints require `accountId` (create already required; list/filter contract standardized).
- Remove/disable account hard-delete endpoint behavior; add/retain archive/unarchive endpoints if enabled.

6. Validation and rollout:
- Run focused frontend and backend tests for routes, account switching, trade scoping, and no-delete constraints.
- Rollback strategy: restore prior route/component wiring and endpoint behavior if critical issues arise, while preserving DB data integrity.

## Open Questions

- Should active account persistence be frontend-only for MVP, or also persisted to user profile server-side in this same change?
- Archive behavior: should archived accounts be excluded from switcher by default, with explicit filter to include?
- Should `/accounts/:id` for archived accounts allow full edit or restricted fields only?
