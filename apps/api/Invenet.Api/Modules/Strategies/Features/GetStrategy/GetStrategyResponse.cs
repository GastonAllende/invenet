namespace Invenet.Api.Modules.Strategies.Features.GetStrategy;

/// <summary>
/// Response for a single strategy.
/// </summary>
public record GetStrategyResponse(
    Guid Id,
    string Name,
    string? Description,
    bool IsDeleted,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
