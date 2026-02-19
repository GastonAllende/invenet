namespace Invenet.Api.Modules.Strategies.Features.UpdateStrategy;

/// <summary>
/// Request to update an existing strategy.
/// </summary>
public record UpdateStrategyRequest(
    string? Name = null,
    string? Description = null
);
