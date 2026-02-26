namespace Invenet.Api.Modules.Trades.Features.UpdateTrade;

/// <summary>
/// Response returned after successfully updating a trade (HTTP 200).
/// </summary>
public record UpdateTradeResponse(
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
