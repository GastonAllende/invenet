namespace Invenet.Api.Modules.Strategies.Features.CreateStrategyVersion;

public record CreateStrategyVersionRequest(
    string? Timeframe,
    string EntryRules,
    string ExitRules,
    string RiskRules,
    string? Notes = null
);
