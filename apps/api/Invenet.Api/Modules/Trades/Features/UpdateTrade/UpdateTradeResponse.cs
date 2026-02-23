namespace Invenet.Api.Modules.Trades.Features.UpdateTrade;

/// <summary>
/// Response returned after successfully updating a trade (HTTP 200).
/// </summary>
public record UpdateTradeResponse(
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
