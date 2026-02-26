namespace Invenet.Api.Modules.Trades.Features.CreateTrade;

/// <summary>
/// Response returned after successfully creating a trade (HTTP 201).
/// </summary>
public record CreateTradeResponse(
    Guid Id,
    Guid AccountId,
    Guid? StrategyVersionId,
    Guid? StrategyId,
    string? StrategyName,
    int? StrategyVersionNumber,
    string Direction,
    DateTime OpenedAt,
    DateTime? ClosedAt,
    string Symbol,
    decimal EntryPrice,
    decimal? ExitPrice,
    decimal Quantity,
    decimal? RMultiple,
    decimal? Pnl,
    string[]? Tags,
    string? Notes,
    bool IsArchived,
    string Status,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
