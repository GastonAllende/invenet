namespace Invenet.Api.Modules.Strategies.Features.ListStrategies;

public record CurrentVersionSummary(
    Guid Id,
    int VersionNumber,
    DateTime CreatedAt,
    string? Timeframe
);

public record StrategyListItem(
    Guid Id,
    string Name,
    string? Market,
    string? DefaultTimeframe,
    bool IsArchived,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    CurrentVersionSummary? CurrentVersion
);

public record ListStrategiesResponse(
    IEnumerable<StrategyListItem> Strategies,
    int Total
);
