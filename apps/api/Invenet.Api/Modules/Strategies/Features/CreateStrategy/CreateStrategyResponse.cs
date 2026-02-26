namespace Invenet.Api.Modules.Strategies.Features.CreateStrategy;

public record CreateStrategyResponse(
    Guid Id,
    string Name,
    string? Market,
    string? DefaultTimeframe,
    bool IsArchived,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    Guid VersionId,
    int VersionNumber
);
