namespace Invenet.Api.Modules.Strategies.Features.UpdateStrategy;

/// <summary>
/// Response after updating a strategy.
/// </summary>
public record UpdateStrategyResponse(
    Guid Id,
    string Name,
    string? Description,
    bool IsDeleted,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);
