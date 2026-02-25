## ADDED Requirements

### Requirement: Analytics page displays embedded TradingView widget
The system SHALL render a TradingView chart widget within the analytics page so users can inspect market context without leaving the application.

#### Scenario: Widget container is shown on analytics page
- **WHEN** a user opens the analytics page
- **THEN** the page includes a dedicated TradingView widget section in the analytics layout

### Requirement: Users can configure widget symbol and timeframe
The system SHALL allow users to set the widget symbol and timeframe from analytics controls, and MUST update the rendered widget to reflect the selected values.

#### Scenario: User changes symbol and timeframe
- **WHEN** a user selects a different symbol or timeframe in the widget controls
- **THEN** the widget reloads using the selected symbol and timeframe

### Requirement: Widget handles loading and failure states
The system SHALL present deterministic loading and error states for the TradingView widget, and MUST keep the rest of the analytics page usable if widget initialization fails.

#### Scenario: Widget script loads successfully
- **WHEN** TradingView resources load and the widget initializes
- **THEN** loading state is cleared and the chart is visible to the user

#### Scenario: Widget fails to load
- **WHEN** TradingView resources fail to load or initialization errors occur
- **THEN** the UI shows an error state with retry guidance while analytics metrics remain available
