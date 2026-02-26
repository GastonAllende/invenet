namespace Invenet.Api.Modules.Strategies.Features.GetStrategy;

public record StrategyVersionDetail(
    Guid Id,
    int VersionNumber,
    string? Timeframe,
    string EntryRules,
    string ExitRules,
    string RiskRules,
    string? Notes,
    DateTime CreatedAt,
    Guid CreatedByUserId
);

public record StrategyVersionHistoryItem(
    Guid Id,
    int VersionNumber,
    DateTime CreatedAt,
    Guid CreatedByUserId
);

public record GetStrategyResponse(
    Guid Id,
    string Name,
    string? Market,
    string? DefaultTimeframe,
    bool IsArchived,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    StrategyVersionDetail? CurrentVersion,
    IEnumerable<StrategyVersionHistoryItem> Versions
);
