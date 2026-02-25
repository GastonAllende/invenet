## Context

The analytics page currently requires users to leave the application to inspect market charts before interpreting trading metrics. The change introduces a TradingView widget directly in analytics, which adds an external script dependency and requires safe loading/error handling in the Angular/Nx frontend. The integration should remain scoped to analytics and avoid backend/API changes.

## Goals / Non-Goals

**Goals:**
- Add an embedded TradingView widget to analytics with configurable symbol and timeframe.
- Ensure resilient behavior with explicit loading, success, and error states.
- Keep implementation modular so analytics owns widget lifecycle and configuration state.
- Prevent regressions in existing analytics data panels.

**Non-Goals:**
- Building a custom charting engine or replacing TradingView with an in-house solution.
- Adding backend endpoints specifically for TradingView integration.
- Reworking the full analytics layout beyond adding the widget section.

## Decisions

1. Introduce a dedicated Angular wrapper component for TradingView embed management.
- Rationale: isolates script initialization, cleanup, and input mapping from page-level analytics logic.
- Alternative considered: inline script handling inside analytics page component; rejected because it couples third-party lifecycle code with page orchestration.

2. Use a lightweight widget configuration state (symbol/timeframe) in analytics feature state.
- Rationale: keeps user-selected chart context reactive and testable without global app state expansion.
- Alternative considered: hardcoded widget configuration; rejected because it does not satisfy configurability requirement.

3. Load TradingView script dynamically with idempotent guard + fallback UI.
- Rationale: avoids duplicate script injections across re-renders and supports deterministic error handling.
- Alternative considered: static script include in global index; rejected because it loads on unrelated routes and weakens isolation.

4. Render widget only in browser runtime and clean up on component destroy.
- Rationale: protects against runtime issues in non-browser contexts and prevents leaked widget instances when navigating.
- Alternative considered: rely on automatic DOM teardown only; rejected due to risk of stale third-party resources.

## Risks / Trade-offs

- [External dependency outage or API changes] -> Mitigation: show explicit error state with retry action and keep analytics core panels usable.
- [Performance overhead from third-party script] -> Mitigation: lazy-load only on analytics route and initialize widget after container is visible.
- [Race conditions during route transitions] -> Mitigation: use guarded script loader + lifecycle cleanup on destroy.
- [Configuration mismatch with unsupported symbols/timeframes] -> Mitigation: validate/normalize allowed values before widget initialization.

## Migration Plan

1. Implement wrapper component and analytics integration behind a feature flag or controlled rollout condition if needed.
2. Validate locally with analytics route navigation, reload scenarios, and script-load failure simulation.
3. Release with monitoring for frontend errors related to widget load/init.
4. Rollback path: disable widget rendering block (or feature flag) while keeping analytics page functional.

## Open Questions

- Should symbol/timeframe defaults come from user preferences if available, or remain analytics defaults?
- Do we need to persist widget selections across sessions, or only per-page session state?
- Are there compliance or branding constraints for TradingView attribution within the analytics layout?
