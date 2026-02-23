namespace Invenet.Api.Modules.Trades.Features.GetTrade;

/// <summary>
/// Shared response shape for a single trade (used by create and update).
/// </summary>
public record GetTradeResponse(
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
