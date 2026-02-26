namespace Invenet.Api.Modules.Trades.Features.GetTrade;

/// <summary>
/// Shared response shape for a single trade (used by create and update).
/// </summary>
public record GetTradeResponse(
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
