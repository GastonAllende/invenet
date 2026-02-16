# Code Review Checklist

This checklist complements [reviewer-agent.md](agent-prompts/reviewer-agent.md) and provides actionable items for code reviewers (human or AI).

## Pre-Review

- [ ] All CI checks pass (lint, test, build)
- [ ] PR/MR is linked to spec in `docs/specs/` (if applicable)
- [ ] Changed files listed match spec's "Affected Projects/Files"

## Functional Correctness

- [ ] Code implements all acceptance criteria from spec
- [ ] No behavior implemented that's not in spec or agreed upon
- [ ] Edge cases and error states are handled
- [ ] User-facing errors have clear, actionable messages
- [ ] API contracts match between frontend and backend

## Code Quality

### General

- [ ] Code follows existing patterns in the codebase
- [ ] No commented-out code or debug statements
- [ ] No hardcoded values that should be configuration
- [ ] Meaningful variable/function names
- [ ] Functions are focused and single-purpose

### Frontend (Angular)

**Reference:** [ANGULAR_BEST_PRACTICES.md](ANGULAR_BEST_PRACTICES.md) for detailed patterns.

- [ ] Uses standalone components (no NgModules)
- [ ] Uses `inject()` instead of constructor DI
- [ ] Uses signals for local state, SignalStore for shared state
- [ ] Uses native control flow (`@if`, `@for`) not structural directives
- [ ] Uses `input()`/`output()` functions, not decorators
- [ ] `ChangeDetectionStrategy.OnPush` set on components
- [ ] PrimeNG components used before custom UI
- [ ] No arrow functions in templates
- [ ] No `ngClass`/`ngStyle` (use `class`/`style` bindings)

### Backend (.NET)

- [ ] Controllers are thin; logic in services/handlers
- [ ] Uses `async`/`await` for I/O operations
- [ ] Returns `ActionResult<T>` from controller actions
- [ ] Proper HTTP status codes (200, 201, 400, 401, 404, 500, etc.)
- [ ] Input validation on all endpoints
- [ ] Uses `AsNoTracking()` for read-only queries
- [ ] Module boundaries respected (no cross-module direct references)
- [ ] Entity configurations in module's `Infrastructure/Data/`

## Testing

- [ ] Unit tests added/updated for new functionality
- [ ] Tests cover happy path and error cases
- [ ] Integration/E2E tests added for user-facing features (per spec)
- [ ] Tests are deterministic and don't rely on timing/randomness
- [ ] Test names clearly describe what is being tested
- [ ] All tests pass locally and in CI

## Security

- [ ] No sensitive data logged (passwords, tokens, PII)
- [ ] User input is validated and sanitized
- [ ] Authentication/authorization checks on protected endpoints
- [ ] No secrets or API keys in code (use user secrets/env vars)
- [ ] SQL injection prevented (parameterized queries/EF Core)
- [ ] XSS prevented (Angular sanitization, avoid `innerHTML`)

## Performance

- [ ] No N+1 queries; uses `Include()`/`ThenInclude()` appropriately
- [ ] Lazy loading used for routes and heavy components
- [ ] Large lists use virtual scrolling or pagination
- [ ] Images use `NgOptimizedImage` where applicable
- [ ] No unnecessary re-renders (check signal/computed usage)

## Database & Migrations

- [ ] Migration tested locally and rolls back cleanly
- [ ] Migration is idempotent (can be re-run safely)
- [ ] No breaking changes to existing data contracts
- [ ] Indexes added for frequently queried columns
- [ ] Default values or data migration for new required fields

## Documentation

- [ ] Public APIs have clear comments/summaries
- [ ] Complex logic has explanatory comments
- [ ] README/AGENT.md updated if architecture changes
- [ ] Spec updated if behavior deviates with approval

## Risk Assessment

- [ ] Rollback plan documented for backend/data changes
- [ ] Breaking changes flagged and coordinated
- [ ] Dependencies updated are stable versions
- [ ] Feature flags considered for high-risk changes

## Final Gate

- [ ] All acceptance criteria verified with evidence
- [ ] No open questions or TODOs without tracking
- [ ] Team/stakeholder approval obtained if needed

---

## Decision: Approve / Approve with Fixes / Block

**Rationale:**
