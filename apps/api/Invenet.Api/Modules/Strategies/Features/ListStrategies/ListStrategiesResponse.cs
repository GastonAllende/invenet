namespace Invenet.Api.Modules.Strategies.Features.ListStrategies;

/// <summary>
/// Response for a single strategy in the list.
/// </summary>
public record StrategyListItem(
    Guid Id,
    string Name,
    string? Description,
    bool IsDeleted,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

/// <summary>
/// Response for listing strategies with pagination info.
/// </summary>
public record ListStrategiesResponse(
    IEnumerable<StrategyListItem> Strategies,
    int Total
);
