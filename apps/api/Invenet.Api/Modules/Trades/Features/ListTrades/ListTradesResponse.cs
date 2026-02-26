namespace Invenet.Api.Modules.Trades.Features.ListTrades;

/// <summary>
/// A single trade item in the list response.
/// </summary>
public record TradeListItem(
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
    bool IsArchived,
    string Status,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

/// <summary>
/// Response envelope for the list trades endpoint.
/// </summary>
public record ListTradesResponse(
    IReadOnlyList<TradeListItem> Trades,
    int Total
);
