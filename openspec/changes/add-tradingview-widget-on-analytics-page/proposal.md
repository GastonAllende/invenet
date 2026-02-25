## Why

The analytics page currently lacks embedded market context, so users must leave the app to view live charts before evaluating performance and trade behavior. Adding an in-page TradingView widget shortens that workflow and makes analytics decisions faster.

## What Changes

- Add a TradingView chart widget section to the analytics page UI.
- Support configuring the displayed symbol and timeframe from within the analytics experience.
- Define loading and fallback behavior when the widget script or data is unavailable.
- Keep the integration isolated to analytics so other pages are not affected.

## Capabilities

### New Capabilities
- `analytics-tradingview-widget`: Embed and render a TradingView widget in analytics with configurable symbol/timeframe and clear loading/error states.

### Modified Capabilities
- None.

## Impact

- Affected frontend code in the analytics feature/page and its related components/services.
- Adds a third-party dependency on TradingView embed script/runtime.
- Requires UI/state updates for widget configuration and resilience handling.
- No backend API contract changes expected.
