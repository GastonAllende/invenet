namespace Invenet.Api.Modules.Strategies.Features.ListStrategies;

public record CurrentVersionSummary(
    Guid Id,
    int VersionNumber,
    DateTimeOffset CreatedAt,
    string? Timeframe
);

public record StrategyListItem(
    Guid Id,
    string Name,
    string? Market,
    string? DefaultTimeframe,
    bool IsArchived,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    CurrentVersionSummary? CurrentVersion
);

public record ListStrategiesResponse(
    IEnumerable<StrategyListItem> Strategies,
    int Total
);
