## Context

The app is an Angular + PrimeNG trading journal backed by a .NET API and PostgreSQL. Trades currently reference a `strategyId` (optional) with no version pinning — meaning a trade record can't tell you which ruleset was active when the trade was taken. The trade schema is also minimal (no direction enum, no R-multiple, no tags/notes, no close date, no archive support). Entry UX is a single full-page form with no quick-entry path.

The change introduces:

1. A refactored trade data model aligned with versioned strategies and multi-account context.
2. A Quick Log Trade modal (lightweight, any-page trigger).
3. A Full Trade Entry/Edit page with all fields.
4. A Trade Detail read-only page.
5. An enhanced Journal List with filters.

Existing code in scope: `libs/trades/` (model, service, store, shell, form, list components). Dependencies: `AccountsStore`, `ActiveAccountStore`, `StrategiesStore` (already built with archive/versioning).

---

## Goals / Non-Goals

**Goals:**

- Replace `strategyId` with `strategyVersionId` as the required FK on trades; backend resolves `strategyVersionId` from `strategyId` if client sends only `strategyId`.
- Introduce `direction` (Long/Short), `openedAt`, `closedAt`, `rMultiple`, `pnl`, `tags`, `notes`, `isArchived` fields.
- Add archive/unarchive endpoints; remove hard-delete from primary flow.
- Build Quick Log Trade modal accessible from the topbar.
- Build Full Trade Entry/Edit page (`/journal/new`, `/journal/:id/edit`).
- Build Trade Detail page (`/journal/:id`).
- Enhance Journal List (`/journal`) with filters.

**Non-Goals:**

- Chart screenshot upload (deferred).
- Auto P&L calculation on the backend (frontend computes R-multiple; backend stores what it receives).
- Real-time price feeds or broker integrations.
- Changing the Strategy versioning system itself.

---

## Decisions

### D1: Backend resolves `strategyVersionId` from `strategyId`

**Decision**: `POST /trades` accepts `strategyId` (client convenience) OR `strategyVersionId` (explicit). Server always resolves and stores `strategyVersionId`. The stored field is always `strategyVersionId`; `strategyId` is never persisted.

**Rationale**: Clients know the strategy they're trading; fetching the current version ID before every quick-log adds friction and a round trip. Centralising the resolution on the backend keeps the contract simple and prevents stale version IDs on slow networks.

**Alternative considered**: Require client to send `strategyVersionId` always (client fetches it first). Rejected — adds a mandatory extra request in the quick-modal flow.

---

### D2: Frontend fetches current version eagerly in the Quick Modal

**Decision**: When a strategy is selected in the Quick Modal, the frontend immediately calls `GET /api/strategies/:id` to get the `currentVersion.id` and displays it as read-only. `strategyVersionId` is submitted explicitly.

**Rationale**: Shows the user which version they're logging against (important for journaling accuracy). Verifies the version before submission. Makes the payload explicit and self-contained.

---

### D3: Keep archive/unarchive; remove hard-delete from primary flow

**Decision**: Replace `DELETE /trades/:id` with `POST /trades/:id/archive` and `POST /trades/:id/unarchive`. Hard delete is not exposed in the UI.

**Rationale**: Consistent with how Accounts work. Preserves journal history. Hard delete can be a backend-only admin operation.

---

### D4: Trade `status` enum — Open / Closed

**Decision**: Replace the current `Win / Loss / Open` status with `Open / Closed`. P&L sign and R-multiple carry the outcome information.

**Rationale**: `Win/Loss` is redundant if `pnl` is present. Simplifies filtering and sorting. Outcome classification (win/loss/BE) can be derived from `pnl > 0`, `pnl < 0`, or `pnl === 0` in the frontend.

---

### D5: Quick Modal lives in the `trades` lib, triggered by a service/signal

**Decision**: `QuickTradeModalComponent` lives in `libs/trades/src/lib/ui/`. It's controlled via a `QuickTradeService` (a simple signal-based service with `open()` / `close()` methods). The topbar and any page can inject it and call `open()`. The modal is rendered once at the app shell level.

**Rationale**: Avoids duplicating the modal in every page. Follows the same lazy-loaded dynamic import pattern already used in the topbar for account/strategy stores.

---

### D6: Keep `libs/trades/` lib structure; add new components alongside existing ones

**Decision**: New components (`quick-trade-modal`, updated `trade-form`, `trade-detail`, `trade-list`) are added to `libs/trades/src/lib/ui/` and `feature/`. No new Nx library is created.

**Rationale**: The trades domain is self-contained. Adding a new lib for a handful of components is unnecessary overhead.

---

### D7: `direction` enum: Long / Short (replaces BUY / SELL)

**Decision**: Replace `type: 'BUY' | 'SELL'` with `direction: 'Long' | 'Short'`.

**Rationale**: Trading journals use Long/Short for direction. BUY/SELL is ambiguous (a short can start with a SELL).

---

## Risks / Trade-offs

- **[Risk] Data migration** — Existing trades have `strategyId`, not `strategyVersionId`. → Migration must look up the current strategy version for each affected trade at migration time. Trades with a null `strategyId` will have a null `strategyVersionId` (allowed). A rollback script should re-populate `strategyId` from the version's parent if needed.
- **[Risk] Strategy version resolution race** — Between the user selecting a strategy and submitting the quick modal, the strategy owner could publish a new version. → The frontend resolves the version on strategy selection and submits that ID explicitly. The server will validate the version exists and belongs to the strategy. Stale by a few seconds is acceptable in this domain.
- **[Risk] Quick modal state on navigation** — If the user opens the quick modal and navigates away, state could be lost. → The modal is rendered at the app shell level (outside router outlet), so it persists across navigation. State is cleared on close.
- **[Risk] `optionValue` binding on `p-select` in PrimeNG** — The existing topbar uses `optionValue="id"` which returns a primitive string. Confirm this pattern works for strategy version selection in the modal (it does — verified in existing account switcher).

---

## Migration Plan

1. **Backend**: Add DB migration — alter `Trades` table: add `strategyVersionId` (nullable initially), `direction`, `openedAt`, `closedAt`, `rMultiple`, `pnl`, `tags`, `notes`, `isArchived`. Populate `strategyVersionId` from the strategy's current version for all rows where `strategyId` is set.
2. **Backend**: Make `strategyVersionId` non-nullable after migration (or keep nullable for legacy rows if data is incomplete).
3. **Backend**: Add `archive`/`unarchive` endpoints. Remove `DELETE` from routing (or keep it but don't expose in API docs).
4. **Frontend**: Update model, service, store first (data layer). Then update UI components.
5. **Rollback**: Revert DB migration using down script (re-expose `strategyId` column). Revert frontend via Git.

---

## Open Questions

- Should `pnl` and `rMultiple` be computed server-side or accepted from the client? (Current decision: accept from client, no server-side recalculation.)
- Should the quick modal auto-close after save, or stay open for rapid sequential entries? (Decision deferred to UX refinement — default to close after save.)
- Should tags be stored as a PostgreSQL array or a comma-separated string? (Recommendation: array column; exposed as `string[]` in API.)
