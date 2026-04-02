namespace Invenet.Api.Modules.Strategies.Features.CreateStrategy;

public record CreateStrategyResponse(
    Guid Id,
    string Name,
    string? Market,
    string? DefaultTimeframe,
    bool IsArchived,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    Guid VersionId,
    int VersionNumber
);
