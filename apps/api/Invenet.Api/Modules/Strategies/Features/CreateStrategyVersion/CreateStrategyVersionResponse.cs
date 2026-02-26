namespace Invenet.Api.Modules.Strategies.Features.CreateStrategyVersion;

public record CreateStrategyVersionResponse(
    Guid Id,
    int VersionNumber,
    DateTime CreatedAt,
    Guid CreatedByUserId,
    string? Timeframe,
    string EntryRules,
    string ExitRules,
    string RiskRules,
    string? Notes
);
