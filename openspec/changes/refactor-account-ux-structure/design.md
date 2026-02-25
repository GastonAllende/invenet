## Context

The account feature currently behaves as a mostly form-first experience and does not clearly separate onboarding, creation, overview, and editing as distinct UX states. This creates ambiguity for a financial workflow where account configuration defines risk boundaries for downstream activity.

The change introduces route-driven state (`/account/new` vs `/account/:id`), explicit read-only overview mode, inline edit mode, and global `ActiveAccountId` context. The codebase uses Angular + Nx with feature-level SignalStore patterns and a .NET modular backend, so the design should minimize churn while aligning with existing route/store structure.

Constraints:
- Keep MVP scope focused on account lifecycle and account context, not broker integration.
- Avoid modal editing and avoid permanently editable account views.
- Keep account page informational and operationally focused, not analytics-heavy.

## Goals / Non-Goals

**Goals:**
- Establish deterministic account UX states:
- No-account onboarding redirect to `/account/new`
- Account creation as full-page form on `/account/new`
- Account overview as default read-only mode on `/account/:id`
- Inline edit mode toggle on `/account/:id` without route change
- Introduce global `ActiveAccountId` state and set it on create/select.
- Ensure journal, analytics, and AI queries are account-scoped by default.
- Support multi-account expansion with clear “Add Account” and active account indicator.

**Non-Goals:**
- Broker sync/integration.
- Advanced analytics dashboards on the account page.
- Redesign of unrelated application navigation or non-account domain models.

## Decisions

1. Route-first UX state model
- Decision: Model "new" vs "existing" account state through routes (`/account/new`, `/account/:id`) instead of conditional rendering inside a single route.
- Rationale: URL becomes source of truth, improves predictability, deep-linking, and testability.
- Alternative considered: Keep `/account` and branch internal state based on store data.
- Why not: Increases hidden state transitions and makes lifecycle harder to reason about.

2. Default read-only overview with local edit toggle
- Decision: `/account/:id` renders read-only cards by default and toggles to inline edit (`editMode=true`) in local feature store state.
- Rationale: Matches control-panel mental model and prevents accidental edits.
- Alternative considered: Always-editable form view.
- Why not: Conflicts with requested institutional UX and weakens mode clarity.

3. Global `ActiveAccountId` as cross-feature context
- Decision: Store `ActiveAccountId` in global/root state and require account scoping in dependent features.
- Rationale: Multi-account behavior requires a single, explicit context boundary shared across journal, analytics, and AI queries.
- Alternative considered: Resolve active account ad hoc per feature.
- Why not: Leads to inconsistent filtering and data leakage risks between accounts.

4. Backend account-context enforcement contract
- Decision: Account-dependent backend read/query endpoints must require account context and validate that the provided account belongs to the authenticated user.
- Rationale: Frontend `ActiveAccountId` is only safe if server-side authorization and filtering guarantees are consistent and mandatory.
- Alternative considered: Keep current permissive/list-all-user-accounts query patterns and rely on frontend filtering.
- Why not: Allows inconsistent payloads across clients and weakens domain boundaries for multi-account behavior.

5. Onboarding redirect strategy
- Decision: If user has no accounts, redirect to `/account/new` automatically and use focused onboarding copy/CTA.
- Rationale: Enforces account setup before dependent workflows and reduces empty-state ambiguity.
- Alternative considered: Keep user on `/account` with inline empty state panel.
- Why not: Preserves mixed-mode page complexity and dilutes onboarding path.

6. Post-create navigation and activation
- Decision: On account creation, persist, set active account, and redirect:
- Standard flow: `/account/:newId`
- First-account onboarding completion: `/strategies/new`
- Rationale: Supports both account management and first-run progression.
- Alternative considered: Always redirect to `/account/:newId`.
- Why not: Misses explicit onboarding handoff required by product flow.

## Risks / Trade-offs

- [Risk] Route split may break existing links or assumptions to `/account` -> Mitigation: add deterministic redirect from legacy `/account` to `/account/new` or active `/account/:id` based on store/account presence.
- [Risk] Global `ActiveAccountId` adoption may leave unscoped queries in some features -> Mitigation: add shared query contracts and targeted tests for account-id propagation.
- [Risk] Backend endpoints may diverge in account-context enforcement across modules -> Mitigation: define a shared validation pattern and add integration tests for unauthorized or missing account context.
- [Risk] Dual redirect behavior after create can produce inconsistent UX if onboarding detection is wrong -> Mitigation: centralize onboarding-complete predicate (has-at-least-one-account before create).
- [Trade-off] Read-only-first adds one click before edits -> Mitigation: provide clear Edit action in header and preserve fast inline editing.

## Migration Plan

1. Introduce/adjust route configuration for `/account/new` and `/account/:id`, with legacy `/account` redirect logic.
2. Refactor account shell into explicit view modes:
- new mode (full-page creation)
- overview mode (read-only)
- inline edit mode (local feature store flag)
3. Add global `ActiveAccountId` store slice and selectors/actions to set/update active account.
4. Update account creation/update flows to set active account and trigger route transitions + toasts.
5. Add active account indicator and Add Account navigation entry points.
6. Refactor backend account-dependent endpoints to require account context and enforce account ownership checks.
7. Enforce account-id requirement in journal/analytics/AI data queries end-to-end (frontend request + backend filtering).
8. Validate through focused route/store/query tests, including backend authorization and scoping tests; rollout behind normal deployment process.

Rollback approach:
- Revert routing and state changes in a single release unit; fallback to previous account shell behavior while preserving persisted account data.

## Open Questions

- Should onboarding completion be determined strictly by account count prior to save, or by an explicit persisted onboarding flag?
- For account switching UX (future), should switching happen via sidebar selector, header dropdown, or dedicated account list surface first?
- Should account-scoped query enforcement fail fast (error) when `ActiveAccountId` is missing, or silently no-op with empty results?
