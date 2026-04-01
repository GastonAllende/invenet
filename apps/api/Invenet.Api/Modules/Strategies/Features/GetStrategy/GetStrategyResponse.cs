namespace Invenet.Api.Modules.Strategies.Features.GetStrategy;

public record StrategyVersionDetail(
    Guid Id,
    int VersionNumber,
    string? Timeframe,
    string EntryRules,
    string ExitRules,
    string RiskRules,
    string? Notes,
    DateTimeOffset CreatedAt,
    Guid CreatedByUserId
);

public record StrategyVersionHistoryItem(
    Guid Id,
    int VersionNumber,
    DateTimeOffset CreatedAt,
    Guid CreatedByUserId
);

public record GetStrategyResponse(
    Guid Id,
    string Name,
    string? Market,
    string? DefaultTimeframe,
    bool IsArchived,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    StrategyVersionDetail? CurrentVersion,
    IEnumerable<StrategyVersionHistoryItem> Versions
);
