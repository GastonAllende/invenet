## 1. Analytics Widget Foundation

- [x] 1.1 Identify the analytics page component/module where the TradingView section will be mounted and add the widget container region.
- [x] 1.2 Create a dedicated TradingView wrapper component responsible for initializing and tearing down the widget instance.
- [x] 1.3 Add a guarded script-loading utility/service that injects the TradingView script once and exposes load success/failure state.

## 2. Configuration and State Flow

- [x] 2.1 Add widget configuration state (symbol, timeframe) in the analytics feature state layer.
- [x] 2.2 Implement analytics UI controls for symbol and timeframe selection wired to the feature state.
- [x] 2.3 Connect configuration state changes to widget re-initialization so selected values are reflected in the rendered chart.

## 3. Resilience and UX States

- [x] 3.1 Implement explicit loading state UI while TradingView resources are loading and widget is initializing.
- [x] 3.2 Implement explicit error state UI for script/load/init failures with retry action.
- [x] 3.3 Ensure analytics metrics/panels remain functional when the widget fails to load.

## 4. Validation and Rollout Readiness

- [x] 4.1 Add/adjust component tests for widget section rendering, config changes, and failure fallback behavior.
- [x] 4.2 Validate route navigation and cleanup behavior to prevent duplicate script injection or leaked widget instances.
- [ ] 4.3 Perform manual verification on analytics page for default symbol/timeframe behavior and end-to-end user flow.
