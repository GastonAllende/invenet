namespace Invenet.Api.Modules.Strategies.Features.CreateStrategy;

/// <summary>
/// Request to create a new trading strategy.
/// </summary>
public record CreateStrategyRequest(
    string Name,
    string? Description = null
);
