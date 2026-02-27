# Strategies Library (`@invenet/strategies`)

Manages trading strategies and their versions.

## Structure

- **data-access**: Services and stores for fetching/managing strategies.
- **feature**: Smart components and shell for strategy management.
- **ui**: Presentational components for strategy forms and cards.

## Backend Partner

`apps/api/Invenet.Api/Modules/Strategies/` (Draft/Planned)

## Key Concepts

- **Versioning**: Strategies are versioned; trades link to a `strategyVersionId` to maintain historical accuracy even if the strategy rules change.
