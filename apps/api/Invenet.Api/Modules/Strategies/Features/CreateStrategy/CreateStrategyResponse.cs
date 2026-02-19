namespace Invenet.Api.Modules.Strategies.Features.CreateStrategy;

/// <summary>
/// Response after creating a strategy.
/// </summary>
public record CreateStrategyResponse(
    Guid Id,
    string Name,
    string? Description,
    bool IsDeleted,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
