namespace Invenet.Api.Modules.Strategies.Features.CreateStrategy;

public record CreateStrategyRequest(
    string Name,
    string? Market,
    string? DefaultTimeframe,
    string? Timeframe,
    string EntryRules,
    string ExitRules,
    string RiskRules,
    string? Notes = null
);
