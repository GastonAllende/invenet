namespace Invenet.Api.Modules.Strategies.Features.CreateStrategyVersion;

public record CreateStrategyVersionResponse(
    Guid Id,
    int VersionNumber,
    DateTimeOffset CreatedAt,
    Guid CreatedByUserId,
    string? Timeframe,
    string EntryRules,
    string ExitRules,
    string RiskRules,
    string? Notes
);
