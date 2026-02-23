namespace Invenet.Api.Modules.Trades.Features.ListTrades;

/// <summary>
/// A single trade item in the list response.
/// </summary>
public record TradeListItem(
    Guid Id,
    Guid AccountId,
    Guid? StrategyId,
    string Type,
    DateTime Date,
    string Symbol,
    decimal EntryPrice,
    decimal? ExitPrice,
    decimal PositionSize,
    decimal InvestedAmount,
    decimal Commission,
    decimal ProfitLoss,
    string Status,
    DateTime CreatedAt
);

/// <summary>
/// Response envelope for the list trades endpoint.
/// </summary>
public record ListTradesResponse(
    IReadOnlyList<TradeListItem> Trades,
    int Total
);
